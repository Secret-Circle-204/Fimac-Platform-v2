import { extractGoogleMapsCoords } from './extract-google-maps'
import { isValidCoordinate } from '../geo/is-valid-coordinate'

export interface ResolvedLocationResult {
  geo?: {
    lat: number
    lng: number
  }
  address?: {
    street: string
    city: string
    state: string
    country: string
    zip: string
  }
  streetHint?: string
  confidence: number
  error?: string
}

/**
 * Expands shortened URLs (maps.app.goo.gl, goo.gl, etc.) by following redirects.
 */
export async function expandShortUrl(shortUrl: string): Promise<string> {
  if (!shortUrl.startsWith('http')) {
    return shortUrl
  }

  // Only follow redirects for known shorteners
  const isShortener = shortUrl.includes('goo.gl') || 
                      shortUrl.includes('app.goo.gl') || 
                      shortUrl.includes('maps.app.goo.gl') ||
                      shortUrl.includes('bit.ly') ||
                      shortUrl.includes('t.co')

  if (!isShortener) {
    return shortUrl
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(shortUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })

    clearTimeout(timeoutId)
    return response.url || shortUrl
  } catch (err) {
    console.warn(`[ResolveLocation] HEAD request failed for ${shortUrl}, trying GET:`, err)
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)

      const response = await fetch(shortUrl, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })

      clearTimeout(timeoutId)
      return response.url || shortUrl
    } catch (getErr) {
      console.error(`[ResolveLocation] Redirect expansion failed for ${shortUrl}:`, getErr)
      return shortUrl
    }
  }
}

/**
 * Parses address parts directly from the URL path of Google Maps.
 * Format usually: /maps/place/Street,+City,+State+Zip,+Country/...
 */
export function parseAddressFromUrlPath(url: string): { street: string; city: string; state: string; country: string; zip: string } | null {
  try {
    const placeRegex = /\/maps\/place\/([^/@]+)/
    const match = url.match(placeRegex)
    if (!match || !match[1]) return null

    const decoded = decodeURIComponent(match[1].replace(/\+/g, ' ')).trim()
    if (!decoded) return null

    // If the path component contains coordinates instead of a real text address, skip parsing
    const dmsRegex = /\d+°/
    const decimalRegex = /^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/
    if (dmsRegex.test(decoded) || decimalRegex.test(decoded)) {
      return null
    }

    const parts = decoded.split(',').map(p => p.trim()).filter(Boolean)
    if (parts.length < 3) return null

    let street = ''
    let city = ''
    let state = ''
    let country = 'Egypt'
    let zip = ''

    // Map from end (country, then state/postcode, then city, then street)
    if (parts.length >= 1) {
      country = parts[parts.length - 1]
    }

    if (parts.length >= 2) {
      const statePart = parts[parts.length - 2]
      // Extract 5-digit zip code if present in the state part
      const zipMatch = statePart.match(/\b\d{5}\b/)
      if (zipMatch) {
        zip = zipMatch[0]
        state = statePart.replace(zip, '').trim()
      } else {
        state = statePart
      }
    }

    if (parts.length >= 3) {
      city = parts[parts.length - 3]
    }

    if (parts.length >= 4) {
      street = parts.slice(0, parts.length - 3).join(', ')
    }

    return { street, city, state, country, zip }
  } catch (err) {
    console.error(`[ResolveLocation] Failed to parse address from URL path:`, err)
    return null
  }
}

/**
 * Resolves properties coordinates and address components from helper input.
 */
export async function resolveLocationInput(
  input: string,
  googleMapsApiKey?: string
): Promise<ResolvedLocationResult> {
  const trimmed = input.trim()
  if (!trimmed) {
    return { confidence: 0, error: 'Empty location input' }
  }

  // 1. Check if it's a coordinate pair (e.g. "30.0444, 31.2357" or "30.0444 31.2357")
  const coordRegex = /^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$/
  const coordMatch = trimmed.match(coordRegex)
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1])
    const lng = parseFloat(coordMatch[2])
    if (isValidCoordinate(lat, lng)) {
      return {
        geo: { lat, lng },
        confidence: 1.0
      }
    }
  }

  // 2. Check if it's a URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('maps.')) {
    const expandedUrl = await expandShortUrl(trimmed)
    
    // Extract coordinates from URL
    const extraction = extractGoogleMapsCoords(expandedUrl)
    
    if (extraction.geo && isValidCoordinate(extraction.geo.lat, extraction.geo.lng)) {
      const result: ResolvedLocationResult = {
        geo: extraction.geo,
        confidence: extraction.confidence
      }

      // Extract a street/place name hint from the URL path if possible
      try {
        const placeRegex = /\/maps\/(?:place|search)\/([^/@?]+)/
        const placeMatch = expandedUrl.match(placeRegex)
        if (placeMatch && placeMatch[1]) {
          const decodedPlace = decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')).trim()
          const dmsRegex = /\d+°/
          const decimalRegex = /^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/
          if (decodedPlace && !dmsRegex.test(decodedPlace) && !decimalRegex.test(decodedPlace)) {
            result.streetHint = decodedPlace
          }
        }
      } catch (_err) {
        // ignore
      }

      // Try to extract address from URL path directly (completely free!)
      const parsedAddress = parseAddressFromUrlPath(expandedUrl)
      if (parsedAddress) {
        result.address = parsedAddress
      }

      return result
    } else {
      return {
        confidence: 0,
        error: extraction.error || 'Failed to extract coordinates from URL'
      }
    }
  }

  // 3. Otherwise treat it as a text address query -> run Geocoding Search
  try {
    if (googleMapsApiKey) {
      // Use official Google Geocoding API
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(trimmed)}&key=${googleMapsApiKey}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const result = data.results[0]
          const { lat, lng } = result.geometry.location

          let street = ''
          let city = ''
          let state = ''
          let country = 'Egypt'
          let zip = ''

          for (const component of result.address_components) {
            const types = component.types
            if (types.includes('route') || types.includes('street_number')) {
              street = street ? `${street} ${component.long_name}` : component.long_name
            } else if (types.includes('sublocality') || types.includes('neighborhood')) {
              if (!street) street = component.long_name
            } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
              city = component.long_name
            } else if (types.includes('administrative_area_level_1')) {
              state = component.long_name
            } else if (types.includes('country')) {
              country = component.long_name
            } else if (types.includes('postal_code')) {
              zip = component.long_name
            }
          }

          return {
            geo: { lat, lng },
            address: { street, city, state, country, zip },
            confidence: 0.95
          }
        }
      }
    }

    // Fallback to OSM Nominatim
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FimacPlatform/1.0 (contact@fimac.com; search geocoder)'
      }
    })
    
    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)

        if (isValidCoordinate(lat, lng)) {
          // Address details can be decomposed via the reverse-geocoding path later,
          // or we can parse it from display_name. To keep it clean, returning coordinates
          // is enough, and syncLocationHook will reverse-geocode it anyway.
          return {
            geo: { lat, lng },
            confidence: 0.85
          }
        }
      }
    }
  } catch (err) {
    console.error(`[ResolveLocation] Geocoding search failed:`, err)
  }

  return { confidence: 0, error: 'Could not resolve location query' }
}
