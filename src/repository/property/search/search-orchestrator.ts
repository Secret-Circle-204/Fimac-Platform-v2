import type { Where } from 'payload'
import { PropertySearchFilters } from '../query-builder'
import { CategorySearchProvider } from './category-search-provider'
import { CoreSearchProvider } from './core-search-provider'
import { ResidentialSearchProvider } from './residential-search-provider'
import { CommercialSearchProvider } from './commercial-search-provider'
import { HospitalitySearchProvider } from './hospitality-search-provider'
import { LandSearchProvider } from './land-search-provider'

export class SearchOrchestrator {
  private coreProvider = new CoreSearchProvider()
  private providers = new Map<string, CategorySearchProvider>()

  constructor() {
    this.providers.set('residential', new ResidentialSearchProvider())
    this.providers.set('commercial', new CommercialSearchProvider())
    this.providers.set('hospitality', new HospitalitySearchProvider())
    this.providers.set('land', new LandSearchProvider())
  }

  buildQuery(filters: PropertySearchFilters): Where {
    // 1. Build Core conditions
    const andConditions = this.coreProvider.buildConditions(filters)

    // 2. Build Category specific conditions
    if (filters.category && filters.category !== 'all') {
      const provider = this.providers.get(filters.category)
      if (provider) {
        const categoryConditions = provider.buildConditions(filters)
        andConditions.push(...categoryConditions)
      }
    }

    return {
      and: andConditions,
    }
  }
}
