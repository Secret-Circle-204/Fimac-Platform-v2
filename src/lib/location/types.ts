/**
 * Utility contracts and internal processing interfaces for the Location system.
 * Document-level types are generated automatically in payload-types.ts.
 */

export interface ExtractionResult {
  geo?: {
    lat: number
    lng: number
  }
  confidence: number
  error?: string
}

export interface NormalizationResult {
  citySlug: string
  stateSlug: string
  normalizedAddress: string
}
