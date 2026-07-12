import type { Where } from 'payload'
import { PropertySearchFilters } from '../query-builder'
import { CategorySearchProvider } from './category-search-provider'
import { isValidCoordinate } from '@/lib/geo/is-valid-coordinate'

export class CoreSearchProvider implements CategorySearchProvider {
  buildConditions(filters: PropertySearchFilters): Where[] {
    const conditions: Where[] = []

    // 1. Default: Hide drafts from public view
    conditions.push({
      'listingStatus.slug': {
        not_equals: 'draft',
      },
    })

    // 2. Listing Status Filter
    const listingStatus = filters.listingStatus || 'all'
    if (listingStatus !== 'all') {
      if (listingStatus === 'draft') {
        conditions.push({
          id: {
            equals: 'non_existent_id_to_force_empty_results',
          },
        })
      } else {
        const dbListingStatus = listingStatus === 'forsale' ? 'for-sale' : listingStatus
        conditions.push({
          'listingStatus.slug': {
            equals: dbListingStatus,
          },
        })
      }
    }

    // 3. Construction Status Filter
    if (filters.constructionStatus && filters.constructionStatus !== 'all') {
      conditions.push({
        'constructionStatus.slug': {
          equals: filters.constructionStatus,
        },
      })
    }

    // 4. Category Filter
    if (filters.category && filters.category !== 'all') {
      conditions.push({
        category: {
          equals: filters.category,
        },
      })
    }

    // 5. Property Type Filter
    if (filters.type && filters.type !== 'all') {
      conditions.push({
        'propertyType.slug': {
          equals: filters.type,
        },
      })
    }

    // 6. Country Filter
    if (filters.country && filters.country !== 'all') {
      conditions.push({
        or: [
          { 'location.address.country': { equals: filters.country } },
          ...(filters.country.toLowerCase() === 'egypt'
            ? [
                { 'location.address.country': { exists: false } },
                { 'location.address.country': { equals: null } },
              ]
            : []),
        ],
      })
    }

    // 7. City Filter
    if (filters.city && filters.city !== 'all') {
      conditions.push({
        'location.address.city': {
          equals: filters.city,
        },
      })
    }

    // 8. Quick Price Filter (Mapping to numeric ranges)
    if (filters.quickPrice && filters.quickPrice !== 'all') {
      const qp = filters.quickPrice
      if (qp === '0-1m') {
        conditions.push({ price: { less_than: 1000000 } })
      } else if (qp === '1m-3m') {
        conditions.push({ price: { greater_than_equal: 1000000, less_than: 3000000 } })
      } else if (qp === '3m-5m') {
        conditions.push({ price: { greater_than_equal: 3000000, less_than: 5000000 } })
      } else if (qp === '5m-10m') {
        conditions.push({ price: { greater_than_equal: 5000000, less_than: 10000000 } })
      } else if (qp === '10m+') {
        conditions.push({ price: { greater_than_equal: 10000000 } })
      }
    }

    // 9. Area Filter
    if (filters.minArea !== undefined && filters.minArea > 0) {
      conditions.push({
        area: {
          greater_than_equal: filters.minArea,
        },
      })
    }
    if (filters.maxArea !== undefined && filters.maxArea > 0) {
      conditions.push({
        area: {
          less_than_equal: filters.maxArea,
        },
      })
    }

    // 10. Features Filter
    if (filters.features && filters.features.length > 0) {
      conditions.push({
        features: {
          in: filters.features,
        },
      })
    }

    // 11. Location / Spatial Filter
    if (filters.location) {
      const orConditions: Where[] = [
        { title: { contains: filters.location } },
        { 'location.address.city': { contains: filters.location } },
        { 'location.address.state': { contains: filters.location } },
        { 'location.address.zip': { contains: filters.location } },
        ...(filters.locationIds && filters.locationIds.length > 0
          ? [{ location_legacy: { in: filters.locationIds } }]
          : []),
      ]

      conditions.push({
        or: orConditions,
      })
    } else if (
      filters.lat !== undefined &&
      filters.lng !== undefined &&
      filters.lat !== null &&
      filters.lng !== null
    ) {
      const radius = filters.radius ?? 50
      const kmPerDegree = 111
      const latDelta = radius / kmPerDegree
      const lngDelta = radius / (kmPerDegree * Math.cos((filters.lat * Math.PI) / 180))

      if (isValidCoordinate(filters.lat, filters.lng)) {
        conditions.push({
          'location.geo.lat': { greater_than_equal: filters.lat - latDelta },
        })
        conditions.push({
          'location.geo.lat': { less_than_equal: filters.lat + latDelta },
        })
        conditions.push({
          'location.geo.lng': { greater_than_equal: filters.lng - lngDelta },
        })
        conditions.push({
          'location.geo.lng': { less_than_equal: filters.lng + lngDelta },
        })
      }
    }

    return conditions
  }
}
