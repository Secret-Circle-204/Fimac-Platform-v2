import type { Where } from 'payload'
import { PropertySearchFilters } from '../query-builder'
import { CategorySearchProvider } from './category-search-provider'

export class HospitalitySearchProvider implements CategorySearchProvider {
  buildConditions(filters: PropertySearchFilters): Where[] {
    const conditions: Where[] = []

    if (filters.starRating && filters.starRating !== 'all') {
      conditions.push({
        'hospitality.starRating': {
          equals: filters.starRating,
        },
      })
    }

    return conditions
  }
}
