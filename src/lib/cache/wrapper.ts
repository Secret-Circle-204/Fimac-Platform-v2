import { unstable_cache as next_unstable_cache } from 'next/cache'
import { cacheTelemetry } from './telemetry'

export function cached<T extends (...args: never[]) => Promise<unknown>>(
  cb: T,
  keyParts: string[],
  options?: {
    revalidate?: number | false
    tags?: string[]
  }
): (...args: Parameters<T>) => ReturnType<T> {
  const cacheKey = keyParts[0] || 'unknown-key'

  // We wrap the callback function.
  // Next.js unstable_cache executes the callback function ONLY on a Cache MISS.
  const wrappedCallback = async (...args: Parameters<T>) => {
    // 1. Record Cache MISS
    cacheTelemetry.recordMiss(cacheKey)

    console.log(`⚡ [CACHE MISS]: ${cacheKey}`)
    console.log(`   └── 🗄️ Database Query started...`)

    const t0 = performance.now()
    try {
      const result = await cb(...args)
      
      // Determine rows returned
      let rowsCount = 0
      if (result) {
        if (Array.isArray(result)) {
          rowsCount = result.length
        } else if (typeof result === 'object' && result !== null) {
          if ('docs' in result) {
            const obj = result as { docs: unknown }
            if (Array.isArray(obj.docs)) {
              rowsCount = obj.docs.length
            } else {
              rowsCount = 1
            }
          } else {
            rowsCount = 1
          }
        } else {
          rowsCount = 1
        }
      }

      const duration = performance.now() - t0
      cacheTelemetry.recordDbResolveTime(duration)

      console.log(`   └── 🗄️ DB Resolve Time: ${duration.toFixed(2)}ms | Rows: ${rowsCount}`)
      console.log(`   └── 📦 Cache Stored`)

      return result
    } catch (e) {
      const duration = performance.now() - t0
      cacheTelemetry.recordDbResolveTime(duration)
      cacheTelemetry.recordError(cacheKey)

      console.log(`   └── ❌ DB Resolve Failed: ${e instanceof Error ? e.message : 'Unknown error'} | Duration: ${duration.toFixed(2)}ms`)
      throw e
    }
  }

  const cachedFunction = next_unstable_cache(
    wrappedCallback as (...args: unknown[]) => Promise<unknown>,
    keyParts,
    options
  )

  // We wrap the returned function.
  // This outer wrapper is executed on EVERY request (Cache HIT or Cache MISS).
  return (async (...args: Parameters<T>) => {
    cacheTelemetry.recordRequest(cacheKey)
    try {
      return await cachedFunction(...args)
    } catch (e) {
      // Re-throw so caller knows it failed
      throw e
    }
  }) as unknown as (...args: Parameters<T>) => ReturnType<T>
}
