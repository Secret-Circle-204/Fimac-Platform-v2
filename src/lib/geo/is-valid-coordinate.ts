/**
 * ═══════════════════════════════════════════════════════════════════
 *  FIMAC Geospatial Safety System — Centralized Coordinate Validator
 * ═══════════════════════════════════════════════════════════════════
 *
 *  SINGLE SOURCE OF TRUTH for all coordinate validation across:
 *  - Payload CMS admin fields (beforeChange hooks)
 *  - Google Maps URL extraction
 *  - Globe 3D renderer (pointOfView calls)
 *  - Leaflet MapContainer (center / position)
 *  - Property search cards (click event dispatch)
 *  - API routes and data transformers
 *
 *  NEVER perform ad-hoc coordinate checks elsewhere.
 *  Always import from this module.
 */

// ─── Core Types ─────────────────────────────────────────────────

export interface GeoPoint {
  lat: number
  lng: number
}

export interface ValidatedGeoResult {
  valid: boolean
  /** Sanitized coordinates (clamped to valid ranges). Only meaningful when valid=true */
  point: GeoPoint
  /** Human-readable reason when invalid */
  reason?: string
}

export interface FallbackGeoOptions {
  /** Attempt to use city-center if exact coords are invalid */
  city?: string | null
  /** Attempt to use state-center if city lookup fails */
  state?: string | null
}

// ─── Constants ──────────────────────────────────────────────────

/** Coordinates within this distance of (0,0) are treated as "unset" */
const NULL_ISLAND_THRESHOLD = 0.01 // ~1.1 km from null island

const LAT_MIN = -90
const LAT_MAX = 90
const LNG_MIN = -180
const LNG_MAX = 180

// ─── Primary Validator ──────────────────────────────────────────

/**
 * Validates a coordinate pair for safety.
 * Rejects: NaN, Infinity, null, undefined, (0,0), out-of-range.
 *
 * @example
 * ```ts
 * import { isValidCoordinate } from '@/lib/geo/is-valid-coordinate'
 *
 * if (isValidCoordinate(lat, lng)) {
 *   // safe to pass to Leaflet / Globe / MapContainer
 * }
 * ```
 */
export function isValidCoordinate(
  lat: unknown,
  lng: unknown,
): boolean {
  return validateCoordinate(lat, lng).valid
}

/**
 * Full validation with diagnostic info.
 * Use when you need the reason for rejection (admin UI, logging).
 */
export function validateCoordinate(
  lat: unknown,
  lng: unknown,
): ValidatedGeoResult {
  // 1. Type guard
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return { valid: false, point: { lat: 0, lng: 0 }, reason: 'Coordinates are null or undefined' }
  }

  const numLat = typeof lat === 'string' ? parseFloat(lat) : Number(lat)
  const numLng = typeof lng === 'string' ? parseFloat(lng) : Number(lng)

  // 2. NaN / Infinity
  if (!Number.isFinite(numLat) || !Number.isFinite(numLng)) {
    return { valid: false, point: { lat: 0, lng: 0 }, reason: `Non-finite values: lat=${lat}, lng=${lng}` }
  }

  // 3. Range check
  if (numLat < LAT_MIN || numLat > LAT_MAX) {
    return { valid: false, point: { lat: numLat, lng: numLng }, reason: `Latitude ${numLat} out of range [${LAT_MIN}, ${LAT_MAX}]` }
  }
  if (numLng < LNG_MIN || numLng > LNG_MAX) {
    return { valid: false, point: { lat: numLat, lng: numLng }, reason: `Longitude ${numLng} out of range [${LNG_MIN}, ${LNG_MAX}]` }
  }

  // 4. Null Island check (0, 0)
  if (Math.abs(numLat) < NULL_ISLAND_THRESHOLD && Math.abs(numLng) < NULL_ISLAND_THRESHOLD) {
    return { valid: false, point: { lat: numLat, lng: numLng }, reason: 'Coordinates are at Null Island (0, 0)' }
  }

  return { valid: true, point: { lat: numLat, lng: numLng } }
}

// ─── Safe Extractor ─────────────────────────────────────────────

/**
 * Safely extracts and validates geo from a property-like object.
 * Returns null if coordinates are invalid/missing.
 *
 * @example
 * ```ts
 * const geo = safeGeo(property.location?.geo)
 * if (geo) mapContainer.setCenter([geo.lat, geo.lng])
 * ```
 */
export function safeGeo(
  geo: { lat?: unknown; lng?: unknown } | null | undefined,
): GeoPoint | null {
  if (!geo) return null
  const result = validateCoordinate(geo.lat, geo.lng)
  return result.valid ? result.point : null
}

// ─── Fallback Geolocation Strategy ─────────────────────────────

/**
 * Known city/state center coordinates for fallback positioning.
 * When a property lacks precise coordinates, we use these to
 * provide an approximate location rather than breaking the UI.
 */
const CITY_CENTERS: Record<string, GeoPoint> = {
  // Egypt
  'hurghada': { lat: 27.2579, lng: 33.8116 },
  'cairo': { lat: 30.0444, lng: 31.2357 },
  'alexandria': { lat: 31.2001, lng: 29.9187 },
  'sharm el sheikh': { lat: 27.9158, lng: 34.3300 },
  'giza': { lat: 30.0131, lng: 31.2089 },
  'luxor': { lat: 25.6872, lng: 32.6396 },
  'aswan': { lat: 24.0889, lng: 32.8998 },
  'el gouna': { lat: 27.1827, lng: 33.6804 },
  'marsa alam': { lat: 25.0693, lng: 34.9018 },
  'ain sokhna': { lat: 29.6018, lng: 32.3107 },
  'new cairo': { lat: 30.0300, lng: 31.4700 },
  'madinaty': { lat: 30.1000, lng: 31.6400 },
  '6th of october': { lat: 29.9375, lng: 30.9275 },
  'north coast': { lat: 31.0700, lng: 28.6700 },
  'sahel': { lat: 31.0800, lng: 28.7000 },
  // International luxury markets
  'dubai': { lat: 25.2048, lng: 55.2708 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'miami': { lat: 25.7617, lng: -80.1918 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
}

const STATE_CENTERS: Record<string, GeoPoint> = {
  'red sea': { lat: 26.8206, lng: 33.7963 },
  'cairo': { lat: 30.0444, lng: 31.2357 },
  'giza': { lat: 29.9870, lng: 31.2118 },
  'alexandria': { lat: 31.2001, lng: 29.9187 },
  'south sinai': { lat: 28.2382, lng: 33.8608 },
  'matrouh': { lat: 31.3543, lng: 27.2373 },
  'suez': { lat: 29.9668, lng: 32.5498 },
  'qalyubia': { lat: 30.3290, lng: 31.2168 },
  'sharqia': { lat: 30.6720, lng: 31.6788 },
}

/**
 * Attempts to resolve coordinates using a fallback strategy:
 * 1. Try exact property coordinates
 * 2. Fall back to city center
 * 3. Fall back to state/governorate center
 * 4. Return null (show "location unavailable" UI)
 *
 * @example
 * ```ts
 * const coords = resolveGeoWithFallback(
 *   property.location?.geo,
 *   { city: property.location?.address?.city, state: property.location?.address?.state }
 * )
 * ```
 */
export function resolveGeoWithFallback(
  geo: { lat?: unknown; lng?: unknown } | null | undefined,
  fallback?: FallbackGeoOptions,
): { point: GeoPoint; precision: 'exact' | 'city' | 'state' } | null {
  // 1. Try exact coordinates
  const exact = safeGeo(geo)
  if (exact) return { point: exact, precision: 'exact' }

  if (!fallback) return null

  // 2. Try city center
  if (fallback.city) {
    const cityKey = fallback.city.toLowerCase().trim()
    const cityCenter = CITY_CENTERS[cityKey]
    if (cityCenter) return { point: cityCenter, precision: 'city' }
  }

  // 3. Try state center
  if (fallback.state) {
    const stateKey = fallback.state.toLowerCase().trim()
    const stateCenter = STATE_CENTERS[stateKey]
    if (stateCenter) return { point: stateCenter, precision: 'state' }
  }

  return null
}

// ─── Payload CMS Field Validator ────────────────────────────────

/**
 * Validates latitude value for use as Payload field `validate` function.
 * Attach to the `lat` number field in the Properties collection.
 */
export function validateLatField(value: unknown): string | true {
  if (value === null || value === undefined || value === '') return true // allow empty
  const num = Number(value)
  if (!Number.isFinite(num)) return 'Latitude must be a valid number'
  if (num < LAT_MIN || num > LAT_MAX) return `Latitude must be between ${LAT_MIN} and ${LAT_MAX}`
  if (Math.abs(num) < NULL_ISLAND_THRESHOLD) return 'Latitude cannot be zero (Null Island)'
  return true
}

/**
 * Validates longitude value for use as Payload field `validate` function.
 * Attach to the `lng` number field in the Properties collection.
 */
export function validateLngField(value: unknown): string | true {
  if (value === null || value === undefined || value === '') return true // allow empty
  const num = Number(value)
  if (!Number.isFinite(num)) return 'Longitude must be a valid number'
  if (num < LNG_MIN || num > LNG_MAX) return `Longitude must be between ${LNG_MIN} and ${LNG_MAX}`
  if (Math.abs(num) < NULL_ISLAND_THRESHOLD) return 'Longitude cannot be zero (Null Island)'
  return true
}
