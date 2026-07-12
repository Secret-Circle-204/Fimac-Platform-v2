import type { Where } from 'payload'
import { PropertySearchFilters } from '../query-builder'

export interface CategorySearchProvider {
  buildConditions(filters: PropertySearchFilters): Where[]
}
