type AnalyticsCache = {
  data: unknown | null
  timestamp: number
}

const globalForCache = global as unknown as {
  analyticsCache: AnalyticsCache
}

if (!globalForCache.analyticsCache) {
  globalForCache.analyticsCache = {
    data: null,
    timestamp: 0,
  }
}

export const analyticsCache = {
  get: (ttlMs: number = 30000) => {
    const cache = globalForCache.analyticsCache
    const now = Date.now()
    if (cache.data && now - cache.timestamp < ttlMs) {
      console.log(`📦 [Cache] Reading analytics from memory cache (age: ${Math.round((now - cache.timestamp)/1000)}s)`)
      return cache.data
    }
    return null
  },
  set: (data: unknown) => {
    console.log(`📦 [Cache] Writing analytics to memory cache`)
    globalForCache.analyticsCache = {
      data,
      timestamp: Date.now(),
    }
  },
  clear: () => {
    console.log(`📦 [Cache] Clearing analytics memory cache (On-Demand Revalidation triggered)`)
    globalForCache.analyticsCache = {
      data: null,
      timestamp: 0,
    }
  }
}
