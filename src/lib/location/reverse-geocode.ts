import { isValidCoordinate } from '../geo/is-valid-coordinate'

export interface ReverseGeocodeResult {
  street: string
  city: string
  state: string
  country: string
  zip: string
}

/**
 * Reverse geocodes coordinates to address components using Google Maps or OpenStreetMap Nominatim.
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  googleMapsApiKey?: string
): Promise<ReverseGeocodeResult | null> {
  if (!isValidCoordinate(lat, lng)) {
    console.warn(`[ReverseGeocode] Invalid coordinates passed: (${lat}, ${lng})`)
    return null
  }

  // 1. Try Google Geocoding API if key is present
  if (googleMapsApiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const result = data.results[0]
          
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

          return { street, city, state, country, zip }
        }
      }
    } catch (err) {
      console.error(`[ReverseGeocode] Google Reverse Geocoding failed:`, err)
    }
  }

  // 2. Fallback to OpenStreetMap Nominatim API
  try {
    const fetchAddress = async (zoomLevel?: number) => {
      try {
        const zoomParam = zoomLevel !== undefined ? `&zoom=${zoomLevel}` : ''
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en${zoomParam}`
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
          return await response.json()
        }
      } catch (err) {
        console.error(`[ReverseGeocode] Nominatim fetch failed at zoom ${zoomLevel}:`, err)
      }
      return null
    }

    const data = await fetchAddress() // default zoom (18 - street level)
    if (data && data.address) {
      const addr = data.address

      const country = addr.country || 'Egypt'
      const state = addr.state || addr.governorate || addr.county || ''

      // Extract street
      let street = addr.road || addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || addr.locality || addr.place || ''
      if (addr.house_number && (addr.road || addr.locality)) {
        street = `${addr.house_number} ${addr.road || addr.locality}`
      }

      // Extract city
      let city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.county || ''

      // If city is empty, query at a broader zoom level (zoom=10) to find the parent administrative city/town dynamically
      if (!city) {
        const parentData = await fetchAddress(10)
        if (parentData && parentData.address) {
          const pAddr = parentData.address
          city = pAddr.city || pAddr.town || pAddr.village || pAddr.municipality || pAddr.county || ''
        }
      }

      const zip = addr.postcode || ''

      return { street, city, state, country, zip }
    }
  } catch (err) {
    console.error(`[ReverseGeocode] Nominatim Reverse Geocoding failed:`, err)
  }

  return null
}
