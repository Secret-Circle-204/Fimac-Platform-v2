import type { ExtractionResult } from './types'

/**
 * Extracts latitude and longitude from various Google Maps URL formats.
 * Supported formats:
 * - https://www.google.com/maps/@{lat},{lng},{zoom}z
 * - https://www.google.com/maps/place/{address}/@{lat},{lng},{zoom}z
 * - https://www.google.com/maps/search/{query}/@{lat},{lng},{zoom}z
 * 
 * Note: Shortened URLs (goo.gl) are not supported without a network request to expand them.
 */
export function extractGoogleMapsCoords(url: string): ExtractionResult {
  if (!url || typeof url !== 'string') {
    return { confidence: 0, error: 'Invalid URL input' }
  }

  try {
    // 1. Try to find the exact pin location first using !3d and !4d
    // Google Maps uses !3d for Latitude and !4d for Longitude in place URLs
    const pinRegex = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/
    const pinMatch = url.match(pinRegex)
    
    if (pinMatch && pinMatch[1] && pinMatch[2]) {
      const lat = parseFloat(pinMatch[1])
      const lng = parseFloat(pinMatch[2])
      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          geo: { lat, lng },
          confidence: 1.0 // Exact pin location
        }
      }
    }

    // 2. Try to find direct coordinates in the URL path (e.g. /maps/search/27.144033,+33.827146)
    // This happens when sharing a coordinate search pin, which resolves to maps.app.goo.gl and redirects to /maps/search/lat,+lng
    const pathCoordsRegex = /\/maps\/(?:search|place)\/(-?\d+\.\d+),\s*\+?(-?\d+\.\d+)/
    const pathCoordsMatch = url.match(pathCoordsRegex)
    if (pathCoordsMatch && pathCoordsMatch[1] && pathCoordsMatch[2]) {
      const lat = parseFloat(pathCoordsMatch[1])
      const lng = parseFloat(pathCoordsMatch[2])
      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          geo: { lat, lng },
          confidence: 1.0
        }
      }
    }

    // 3. Fallback to Camera Center: @(-?\d+\.\d+),(-?\d+\.\d+)
    const coordRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/
    const match = url.match(coordRegex)

    if (match && match[1] && match[2]) {
      const lat = parseFloat(match[1])
      const lng = parseFloat(match[2])

      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          geo: { lat, lng },
          confidence: 0.9 // Camera center, might be slightly offset from exact pin
        }
      }
    }

    // Secondary Check: query params (sometimes found in search or embed urls)
    const urlObj = new URL(url)
    const queryCoords = urlObj.searchParams.get('q') || urlObj.searchParams.get('query')
    if (queryCoords) {
      const parts = queryCoords.split(',')
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0])
        const lng = parseFloat(parts[1])
        if (!isNaN(lat) && !isNaN(lng)) {
          return {
            geo: { lat, lng },
            confidence: 0.8
          }
        }
      }
    }

    return { confidence: 0, error: 'No coordinates found in URL' }
  } catch (err) {
    return { confidence: 0, error: err instanceof Error ? err.message : 'Unknown parsing error' }
  }
}
