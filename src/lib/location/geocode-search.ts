export type GeoBoundingBox = {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
  displayName: string
}

// Global hot-reload-safe cache for geocoded queries
const globalForGeocode = globalThis as unknown as {
  geocodeCache: Map<string, GeoBoundingBox | null>
}

const geocodeCache = globalForGeocode.geocodeCache || new Map<string, GeoBoundingBox | null>()

if (process.env.NODE_ENV !== 'production') {
  globalForGeocode.geocodeCache = geocodeCache
}

/**
 * Geocodes a search query using the public, free OpenStreetMap Nominatim API.
 * Uses a short timeout to prevent slow responses from blocking page load.
 */
export async function geocodeSearch(query: string): Promise<GeoBoundingBox | null> {
  if (!query || query.trim().length < 2) {
    return null
  }

  const cacheKey = query.trim().toLowerCase()
  if (geocodeCache.has(cacheKey)) {
    console.log(`🎯 [Geocode Cache] Cache hit for query "${cacheKey}"`)
    return geocodeCache.get(cacheKey) || null
  }

  // Define a custom controller to enforce a strict timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 2000)

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query,
    )}&format=json&limit=1`

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Descriptive User-Agent as required by Nominatim usage policy
        'User-Agent': 'FimacPlatform/1.0 (contact@fimac.com; search geocoder)',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (!Array.isArray(data) || data.length === 0) {
      // Cache empty result to prevent repeated failed lookups
      if (geocodeCache.size >= 1000) {
        const firstKey = geocodeCache.keys().next().value
        if (firstKey !== undefined) geocodeCache.delete(firstKey)
      }
      geocodeCache.set(cacheKey, null)
      return null
    }

    const result = data[0]
    let boundingBoxResult: GeoBoundingBox | null = null
    
    // Check if the place has a bounding box and is of reasonable importance
    if (Array.isArray(result.boundingbox) && result.boundingbox.length === 4) {
      const minLat = parseFloat(result.boundingbox[0])
      const maxLat = parseFloat(result.boundingbox[1])
      const minLng = parseFloat(result.boundingbox[2])
      const maxLng = parseFloat(result.boundingbox[3])

      if (!isNaN(minLat) && !isNaN(maxLat) && !isNaN(minLng) && !isNaN(maxLng)) {
        boundingBoxResult = {
          minLat,
          maxLat,
          minLng,
          maxLng,
          displayName: result.display_name,
        }
      }
    }

    // Cache the result
    if (geocodeCache.size >= 1000) {
      const firstKey = geocodeCache.keys().next().value
      if (firstKey !== undefined) geocodeCache.delete(firstKey)
    }
    geocodeCache.set(cacheKey, boundingBoxResult)

    return boundingBoxResult
  } catch (error) {
    // Silently handle timeouts or network errors
    console.warn(`[GeocodeSearch] Failed to geocode query "${query}":`, error)
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}
