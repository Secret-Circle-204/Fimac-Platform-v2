export interface CachedIPLocation {
  country: string
  city: string
  region: string
}

interface GlobalWithIPCache {
  ipLocationsCache?: Map<string, { location: CachedIPLocation; timestamp: number }>
  ipCacheCleanupInterval?: ReturnType<typeof setInterval>
}

const globalRef = global as unknown as GlobalWithIPCache

// Retrieve or initialize the cache map on the global object (preserves cache during Next.js hot-reloads)
const cache = globalRef.ipLocationsCache || new Map<string, { location: CachedIPLocation; timestamp: number }>()

if (process.env.NODE_ENV !== "production") {
  globalRef.ipLocationsCache = cache
}

// Clear any existing interval to prevent memory leaks during hot reloads in development
if (globalRef.ipCacheCleanupInterval) {
  clearInterval(globalRef.ipCacheCleanupInterval)
}

export const ipLocationsCache = {
  cache,
  TTL: 300000, // 5 minutes in milliseconds
  MAX_SIZE: 5000, // FIFO Max entries limit

  /**
   * Get location from cache if not expired
   */
  get(hashedIp: string): CachedIPLocation | null {
    const cached = this.cache.get(hashedIp)
    if (cached && (Date.now() - cached.timestamp < this.TTL)) {
      return cached.location
    }
    if (cached) {
      // Lazy cleanup of expired entry
      this.cache.delete(hashedIp)
    }
    return null
  },

  /**
   * Store location in cache with current timestamp, using FIFO eviction if limit is exceeded
   */
  set(hashedIp: string, location: CachedIPLocation) {
    if (this.cache.size >= this.MAX_SIZE && !this.cache.has(hashedIp)) {
      // Retrieve the oldest key in the Map (first element inserted)
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
    this.cache.set(hashedIp, {
      location,
      timestamp: Date.now(),
    })
  }
}

// Start the periodic cleanup task (every 60 seconds)
globalRef.ipCacheCleanupInterval = setInterval(() => {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > ipLocationsCache.TTL) {
      cache.delete(key)
    }
  }
}, 60000)
