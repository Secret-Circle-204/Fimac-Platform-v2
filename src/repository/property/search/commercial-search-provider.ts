import type { Where } from 'payload'
import { PropertySearchFilters } from '../query-builder'
import { CategorySearchProvider } from './category-search-provider'

export class CommercialSearchProvider implements CategorySearchProvider {
  buildConditions(_filters: PropertySearchFilters): Where[] {
    // Basic search filtering for commercial properties
    const conditions: Where[] = []
    // Add additional custom commercial filters here if passed in filters
    return conditions
  }
}
