// Global reference interface for dev hot-reloading preservation
interface GlobalWithViewsCache {
  viewsMemoryCache?: Map<string, { views: number; timestamp: number }>
}

const globalRef = global as unknown as GlobalWithViewsCache

// Retrieve or initialize the cache map on the global object
const cache = globalRef.viewsMemoryCache || new Map<string, { views: number; timestamp: number }>()

if (process.env.NODE_ENV !== "production") {
  globalRef.viewsMemoryCache = cache
}

export const viewsMemoryCache = {
  cache,
  TTL: 30000, // 30 seconds

  get(id: string): number | null {
    const cached = this.cache.get(id)
    if (cached && (Date.now() - cached.timestamp < this.TTL)) {
      return cached.views
    }
    return null
  },

  set(id: string, views: number) {
    this.cache.set(id, {
      views,
      timestamp: Date.now(),
    })
  }
}
