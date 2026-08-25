export interface TelemetryStats {
  requests: number
  misses: number
  errors: number
  estimatedHits: number
  estimatedHitRate: string
  invalidations: number
  dbResolveTimeMs: number
  queriesRun: number
  avgDbResolveTimeMs: string
  tagInvalidations: Record<string, number>
  keyStats: Record<
    string,
    {
      requests: number
      misses: number
      errors: number
      estimatedHits: number
      estimatedHitRate: string
    }
  >
}

interface KeyStats {
  requests: number
  misses: number
  errors: number
  estimatedHits: number
  estimatedHitRate: string
}

// Survive hot-reloads in Next.js development
const globalRef = globalThis as unknown as {
  cacheTelemetryInstance?: CacheTelemetry
}

class CacheTelemetry {
  private requests = 0
  private misses = 0
  private errors = 0
  private invalidations = 0
  private dbResolveTimeMs = 0
  private queriesRun = 0
  private tagInvalidations: Record<string, number> = {}
  
  // Use Map for keyStats to prevent memory leak and preserve insertion order for LRU/FIFO eviction
  private keyStatsMap = new Map<string, KeyStats>()
  private readonly MAX_KEYS = 100

  recordRequest(key: string) {
    this.requests++
    this.initKey(key)
    const stats = this.keyStatsMap.get(key)!
    stats.requests++
    this.recalculateKey(stats)
  }

  recordMiss(key: string) {
    this.misses++
    this.initKey(key)
    const stats = this.keyStatsMap.get(key)!
    stats.misses++
    this.recalculateKey(stats)
  }

  recordError(key: string) {
    this.errors++
    this.initKey(key)
    const stats = this.keyStatsMap.get(key)!
    stats.errors++
    this.recalculateKey(stats)
  }

  recordDbResolveTime(durationMs: number) {
    this.queriesRun++
    this.dbResolveTimeMs += durationMs
  }

  recordInvalidation(tag: string) {
    this.invalidations++
    this.tagInvalidations[tag] = (this.tagInvalidations[tag] || 0) + 1
  }

  getStats(): TelemetryStats {
    const estimatedHits = Math.max(0, this.requests - this.misses)
    const estimatedHitRate =
      this.requests > 0
        ? `${((estimatedHits / this.requests) * 100).toFixed(2)}%`
        : '0.00%'

    const avgDbResolveTimeMs =
      this.queriesRun > 0
        ? `${(this.dbResolveTimeMs / this.queriesRun).toFixed(2)}ms`
        : '0.00ms'

    // Convert Map to plain object for JSON serialization
    const keyStatsObj: Record<string, KeyStats> = {}
    this.keyStatsMap.forEach((val, key) => {
      keyStatsObj[key] = val
    })

    return {
      requests: this.requests,
      misses: this.misses,
      errors: this.errors,
      estimatedHits,
      estimatedHitRate,
      invalidations: this.invalidations,
      dbResolveTimeMs: this.dbResolveTimeMs,
      queriesRun: this.queriesRun,
      avgDbResolveTimeMs,
      tagInvalidations: this.tagInvalidations,
      keyStats: keyStatsObj,
    }
  }

  private initKey(key: string) {
    if (!this.keyStatsMap.has(key)) {
      // LRU Eviction: Remove oldest key if map exceeds limit
      if (this.keyStatsMap.size >= this.MAX_KEYS) {
        const oldestKey = this.keyStatsMap.keys().next().value
        if (oldestKey !== undefined) {
          this.keyStatsMap.delete(oldestKey)
        }
      }

      this.keyStatsMap.set(key, {
        requests: 0,
        misses: 0,
        errors: 0,
        estimatedHits: 0,
        estimatedHitRate: '0.00%',
      })
    }
  }

  private recalculateKey(k: KeyStats) {
    k.estimatedHits = Math.max(0, k.requests - k.misses)
    k.estimatedHitRate =
      k.requests > 0 ? `${((k.estimatedHits / k.requests) * 100).toFixed(2)}%` : '0.00%'
  }
}

export const cacheTelemetry = globalRef.cacheTelemetryInstance || new CacheTelemetry()

if (process.env.NODE_ENV !== 'production') {
  globalRef.cacheTelemetryInstance = cacheTelemetry
}
