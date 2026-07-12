import type { Where } from 'payload'

export interface PropertySearchFilters {
  location?: string
  lat?: number
  lng?: number
  radius?: number
  type?: string
  country?: string
  city?: string
  quickPrice?: string
  listingStatus?: string
  constructionStatus?: string
  bedrooms?: number
  bathrooms?: number
  locationIds?: (string | number)[]
}

/**
 * Centrally builds a Payload CMS Where query based on search filters.
 * Filters are applied at the database query level to ensure SQL-level efficiency.
 */
export function buildPropertySearchQuery(filters: PropertySearchFilters): Where {
  const andConditions: Where[] = []

  // Default behavior: hide drafts from public search under all circumstances
  andConditions.push({
    'listingStatus.slug': {
      not_equals: 'draft',
    },
  })

  const listingStatus = filters.listingStatus || 'all'
  if (listingStatus !== 'all') {
    if (listingStatus === 'draft') {
      // Force empty result if someone tries to query draft
      andConditions.push({
        id: {
          equals: 'non_existent_id_to_force_empty_results',
        },
      })
    } else {
      const dbListingStatus = listingStatus === 'forsale' ? 'for-sale' : listingStatus
      andConditions.push({
        'listingStatus.slug': {
          equals: dbListingStatus,
        },
      })
    }
  }

  // Construction Status Filter
  if (filters.constructionStatus && filters.constructionStatus !== 'all') {
    andConditions.push({
      'constructionStatus.slug': {
        equals: filters.constructionStatus,
      },
    })
  }

  // Type Filter
  if (filters.type && filters.type !== 'all') {
    andConditions.push({
      'propertyType.slug': {
        equals: filters.type,
      },
    })
  }

  // Country Filter
  if (filters.country && filters.country !== 'all') {
    andConditions.push({
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


  // City Filter
  if (filters.city && filters.city !== 'all') {
    andConditions.push({
      'location.address.city': {
        equals: filters.city,
      },
    })
  }

  // Quick Price Filter (Mapping to numeric ranges)
  if (filters.quickPrice && filters.quickPrice !== 'all') {
    const qp = filters.quickPrice
    if (qp === '0-1m') {
      andConditions.push({ price: { less_than: 1000000 } })
    } else if (qp === '1m-3m') {
      andConditions.push({ price: { greater_than_equal: 1000000, less_than: 3000000 } })
    } else if (qp === '3m-5m') {
      andConditions.push({ price: { greater_than_equal: 3000000, less_than: 5000000 } })
    } else if (qp === '5m-10m') {
      andConditions.push({ price: { greater_than_equal: 5000000, less_than: 10000000 } })
    } else if (qp === '10m+') {
      andConditions.push({ price: { greater_than_equal: 10000000 } })
    }
  }

  // Bedrooms Filter
  if (filters.bedrooms && filters.bedrooms > 0) {
    andConditions.push({
      'details.bedrooms': {
        greater_than_equal: filters.bedrooms,
      },
    })
  }

  // Bathrooms Filter
  if (filters.bathrooms && filters.bathrooms > 0) {
    andConditions.push({
      'details.bathrooms': {
        greater_than_equal: filters.bathrooms,
      },
    })
  }

  // Location / Spatial Filter
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

    andConditions.push({
      or: orConditions,
    })
  } else if (filters.lat !== undefined && filters.lng !== undefined && filters.lat !== null && filters.lng !== null) {
    const radius = filters.radius ?? 50
    const kmPerDegree = 111
    const latDelta = radius / kmPerDegree
    const lngDelta = radius / (kmPerDegree * Math.cos((filters.lat * Math.PI) / 180))

    andConditions.push({
      'location.geo.lat': { greater_than_equal: filters.lat - latDelta },
    })
    andConditions.push({
      'location.geo.lat': { less_than_equal: filters.lat + latDelta },
    })
    andConditions.push({
      'location.geo.lng': { greater_than_equal: filters.lng - lngDelta },
    })
    andConditions.push({
      'location.geo.lng': { less_than_equal: filters.lng + lngDelta },
    })
  }

  return {
    and: andConditions,
  }
}
