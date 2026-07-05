import { describe, it, expect } from 'vitest'
import { parseAddressFromUrlPath, resolveLocationInput } from '@/lib/location/resolve-location'
import { reverseGeocode } from '@/lib/location/reverse-geocode'

describe('Smart Location Helper & Utilities', () => {
  describe('parseAddressFromUrlPath', () => {
    it('should extract address components from a long Google Maps place URL', () => {
      const url = 'https://www.google.com/maps/place/Sheraton+Road,+El+Kawther,+Hurghada,+Red+Sea+Governorate,+Egypt/@27.2579,33.8116,14z'
      const address = parseAddressFromUrlPath(url)
      
      expect(address).not.toBeNull()
      expect(address?.street).toBe('Sheraton Road, El Kawther')
      expect(address?.city).toBe('Hurghada')
      expect(address?.state).toBe('Red Sea Governorate')
      expect(address?.country).toBe('Egypt')
    })

    it('should handle addresses with fewer components', () => {
      const url = 'https://www.google.com/maps/place/Hurghada,+Red+Sea+Governorate,+Egypt'
      const address = parseAddressFromUrlPath(url)
      
      expect(address).not.toBeNull()
      expect(address?.city).toBe('Hurghada')
      expect(address?.state).toBe('Red Sea Governorate')
      expect(address?.country).toBe('Egypt')
    })

    it('should return null for URLs containing coordinates instead of textual address in path', () => {
      const url = 'https://www.google.com/maps/place/27%C2%B008\'38.6%22N+33%C2%B049\'35.2%22E/@27.1440527,33.8310421'
      const address = parseAddressFromUrlPath(url)
      expect(address).toBeNull()
    })

    it('should return null for URLs containing only a place name without full address components', () => {
      const url = 'https://www.google.com/maps/place/Rixos+Premium+Magawish+Bay+View/@27.1440527,33.8310421'
      const address = parseAddressFromUrlPath(url)
      expect(address).toBeNull()
    })
  })

  describe('resolveLocationInput', () => {
    it('should parse coordinate pairs directly', async () => {
      const result = await resolveLocationInput('30.0444, 31.2357')
      expect(result.geo).toBeDefined()
      expect(result.geo?.lat).toBe(30.0444)
      expect(result.geo?.lng).toBe(31.2357)
      expect(result.confidence).toBe(1.0)
    })

    it('should resolve a text address query', async () => {
      const result = await resolveLocationInput('Magawish Hurghada')
      expect(result.geo).toBeDefined()
      expect(result.geo?.lat).toBeCloseTo(27.14, 1)
      expect(result.geo?.lng).toBeCloseTo(33.81, 1)
    })

    it('should resolve long Google Maps URLs', async () => {
      const url = 'https://www.google.com/maps/place/Sheraton+Road,+El+Kawther,+Hurghada,+Red+Sea+Governorate,+Egypt/@27.2579,33.8116,14z'
      const result = await resolveLocationInput(url)
      expect(result.geo).toBeDefined()
      expect(result.geo?.lat).toBe(27.2579)
      expect(result.geo?.lng).toBe(33.8116)
      expect(result.address).toBeDefined()
      expect(result.address?.city).toBe('Hurghada')
    })

    it('should resolve Google Maps URLs containing coordinates in path', async () => {
      const url = 'https://www.google.com/maps/search/27.144033,+33.827146?entry=tts'
      const result = await resolveLocationInput(url)
      expect(result.geo).toBeDefined()
      expect(result.geo?.lat).toBe(27.144033)
      expect(result.geo?.lng).toBe(33.827146)
    })

    it('should resolve Google Maps place URL with name and coordinates without calling reverse geocoding', async () => {
      const url = 'https://www.google.com/maps/place/Magawish,+Hurghada,+Red+Sea+Governorate,+Egypt/@27.1415174,33.8123285,14z/data=!3m1!4b1!4m6!3m5!1s0x145263a2307efcf3:0xa292f7678d22be3f!8m2!3d27.1583098!4d33.8058223'
      const result = await resolveLocationInput(url)
      expect(result.geo).toBeDefined()
      expect(result.geo?.lat).toBe(27.1583098)
      expect(result.geo?.lng).toBe(33.8058223)
      expect(result.address).toBeDefined()
      expect(result.address?.street).toBe('Magawish')
      expect(result.address?.city).toBe('Hurghada')
      expect(result.address?.state).toBe('Red Sea Governorate')
      expect(result.address?.country).toBe('Egypt')
    })

    it('should resolve Google Maps place URL for Rixos and extract the place name as streetHint', async () => {
      const url = 'https://www.google.com/maps/place/Rixos+Premium+Magawish+Bay+View/@27.1440527,33.8310421,995m/data=!3m1!1e3!4m13!1m2!2m1!1sMagawish+!3m9!1s0x14528180e1f16251:0xc140a88d822a6d50!5m2!4m1!1i2!8m2!3d27.1429826!4d33.8275765'
      const result = await resolveLocationInput(url)
      expect(result.geo).toBeDefined()
      expect(result.streetHint).toBe('Rixos Premium Magawish Bay View')
    })
  })

  describe('reverseGeocode', () => {
    it('should reverse geocode Egypt coordinates using Nominatim', async () => {
      // Coordinates of Hurghada Marina
      const marinaLat = 27.2272
      const marinaLng = 33.8407
      const address = await reverseGeocode(marinaLat, marinaLng)
      
      expect(address).not.toBeNull()
      expect(address?.country).toBe('Egypt')
      expect(address?.city).toBeDefined()
    })

    it('should reverse geocode Egypt coordinates of Rixos Premium Magawish utilizing fallback locality and city logic', async () => {
      // Coordinates of Rixos Premium Magawish
      const rixosLat = 27.1429826
      const rixosLng = 33.8275765
      const address = await reverseGeocode(rixosLat, rixosLng)
      
      expect(address).not.toBeNull()
      expect(address?.country).toBe('Egypt')
      expect(address?.street).toContain('ريكسوس بريميم مجاويش')
      expect(address?.city).toBe('Hurghada')
      expect(address?.state).toBe('Red Sea')
    })
  })
})
