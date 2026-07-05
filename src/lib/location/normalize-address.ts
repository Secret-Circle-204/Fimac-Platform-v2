import type { NormalizationResult } from './types'

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
}

export function normalizeAddress(
  street: string,
  city: string,
  state: string,
  zip?: string
): NormalizationResult {
  const citySlug = slugify(city)
  const stateSlug = slugify(state)
  
  const rawAddress = `${street} ${city} ${state} ${zip || ''}`
  const normalizedAddress = rawAddress
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Collapse spaces

  return {
    citySlug,
    stateSlug,
    normalizedAddress
  }
}
