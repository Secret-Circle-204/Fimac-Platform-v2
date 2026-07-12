import { unstable_cache } from 'next/cache'
import { getPayloadClient } from '@/db/client'
import type { Where } from 'payload'

import { local } from '@/repository'
import { geocodeSearch } from '@/lib/location/geocode-search'
import { calculateValidPage } from '@/lib/pagination/calculate-valid-page'

// Types for optimized payload responses
export interface DashboardProperty {
  id: string
  title: string
  price?: number | null
  currency?: string | null
  listingStatus: string
  listingStatusName?: string | null
  listingStatusColor?: string | null
  views?: number | null
  location?: {
    address?: {
      fullAddress?: string | null
      country?: string | null
      city?: string | null
      state?: string | null
      street?: string | null
    } | null
  } | null
  propertyType?: {
    name: string
  } | null
  photos?: Array<{
    url?: string | null
    id?: string | null
  }> | null
  sellerRequest?: string | number | null
}

export interface SellerPropertiesResponse {
  docs: DashboardProperty[]
  totalDocs: number
  totalPages: number
  page: number
  shouldRedirect?: boolean
  redirectToPage?: number
}

export interface DashboardSellerRequest {
  id: string | number
  property_title: string
  property_type?: string | number | { name: string } | null
  asking_price?: number | null
  currency?: string | null
  city?: string | null
  country?: string | null
  status?: string | null
  createdAt: string
  publishedProperty?: string | number | {
    id: string | number
    location?: {
      address?: {
        street?: string | null
        city?: string | null
        state?: string | null
      } | null
    } | null
  } | null
}

export interface SellerRequestsResponse {
  docs: DashboardSellerRequest[]
  totalDocs: number
  totalPages: number
  page: number
  shouldRedirect?: boolean
  redirectToPage?: number
}

export interface DashboardPropertyFilters {
  type?: string
  country?: string
  state?: string
  city?: string
  status?: string
  location?: string
  lat?: number | null
  lng?: number | null
  radius?: number
}

// Whitelisted sorts mapping business values to database keys
export const ALLOWED_SORTS: Record<string, string> = {
  newest: '-createdAt',
  oldest: 'createdAt',
  priceAsc: 'price',
  priceDesc: '-price',
  views: '-views',
}

/**
 * Builds a deterministic cache key for properties portfolio queries.
 */
export function buildSellerPropertiesCacheKey(
  sellerId: string | number,
  filters: DashboardPropertyFilters,
  page: number,
  sortKey: string
): string {
  const parts = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== '' && v !== 'all' && v !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  return `seller-portfolio:${sellerId}:${parts || 'default'}:p${page}:s${sortKey}`
}

/**
 * Encapsulates data querying, sorting, filtering, and caching for the Seller Dashboard.
 */
export class SellerDashboardRepository {
  /**
   * Builds the database-level where clause for the seller's properties portfolio.
   */
  private static async buildPropertyQuery(
    sellerId: string | number,
    filters: DashboardPropertyFilters
  ): Promise<Where> {
    const andConditions: Where[] = [
      {
        seller: {
          equals: sellerId,
        },
      },
      {
        'listingStatus.slug': {
          in: ['forsale', 'for-sale', 'sold'],
        },
      },
    ]

    const {
      type = 'all',
      country = 'all',
      state = 'all',
      city = 'all',
      status = 'all',
      location = '',
      lat = null,
      lng = null,
      radius = 50,
    } = filters

    // Type Filter
    if (type !== 'all') {
      andConditions.push({
        'propertyType.slug': {
          equals: type,
        },
      })
    }

    // Country Filter
    if (country !== 'all') {
      andConditions.push({
        or: [
          { 'location.address.country': { equals: country } },
          ...(country.toLowerCase() === 'egypt'
            ? [
                { 'location.address.country': { exists: false } },
                { 'location.address.country': { equals: null } },
              ]
            : []),
        ],
      })
    }

    // State Filter
    if (state !== 'all') {
      andConditions.push({
        'location.address.state': {
          equals: state,
        },
      })
    }

    // City Filter
    if (city !== 'all') {
      andConditions.push({
        'location.address.city': {
          equals: city,
        },
      })
    }



    // Status Filter
    if (status !== 'all') {
      andConditions.push({
        'listingStatus.slug': {
          equals: status,
        },
      })
    }

    // Location Text & Geocode Search
    if (location) {
      const [locationIds, geoBox] = await Promise.all([
        local.location
          .getAll(
            {
              or: [
                { city: { contains: location } },
                { state_name: { contains: location } },
                { state_abbr: { contains: location } },
                { zip: { contains: location } },
              ],
            },
            {
              depth: 0,
              select: { id: true },
            }
          )
          .then((locs) => locs.map((l) => l.id)),
        geocodeSearch(location),
      ])

      const orConditions: Where[] = [
        { title: { contains: location } },
        { 'location.address.city': { contains: location } },
        { 'location.address.state': { contains: location } },
        { 'location.address.zip': { contains: location } },
        ...(locationIds.length > 0 ? [{ location_legacy: { in: locationIds } }] : []),
      ]

      if (geoBox) {
        orConditions.push({
          and: [
            { 'location.geo.lat': { greater_than_equal: geoBox.minLat } },
            { 'location.geo.lat': { less_than_equal: geoBox.maxLat } },
            { 'location.geo.lng': { greater_than_equal: geoBox.minLng } },
            { 'location.geo.lng': { less_than_equal: geoBox.maxLng } },
          ],
        })
      }

      andConditions.push({
        or: orConditions,
      })
    } else if (lat !== null && lng !== null) {
      const kmPerDegree = 111
      const latDelta = radius / kmPerDegree
      const lngDelta = radius / (kmPerDegree * Math.cos((lat * Math.PI) / 180))

      andConditions.push({
        'location.geo.lat': { greater_than_equal: lat - latDelta },
      })
      andConditions.push({
        'location.geo.lat': { less_than_equal: lat + latDelta },
      })
      andConditions.push({
        'location.geo.lng': { greater_than_equal: lng - lngDelta },
      })
      andConditions.push({
        'location.geo.lng': { less_than_equal: lng + lngDelta },
      })
    }

    return {
      and: andConditions,
    }
  }

  /**
   * Retrieves paginated, sorted, and filtered properties for a seller.
   * Leverages unstable_cache and select options.
   */
  static async getSellerProperties(
    sellerId: string | number,
    filters: DashboardPropertyFilters,
    page: number = 1,
    sortParam: string = 'newest'
  ): Promise<SellerPropertiesResponse> {
    const where = await this.buildPropertyQuery(sellerId, filters)
    const dbSortField = ALLOWED_SORTS[sortParam] || '-createdAt'
    const cacheKey = buildSellerPropertiesCacheKey(sellerId, filters, page, sortParam)

    return await unstable_cache(
      async (): Promise<SellerPropertiesResponse> => {
        console.log(`⚡ [DB QUERY - PORTFOLIO]: Fetching properties. Key: ${cacheKey}`)
        const payload = await getPayloadClient()
        const result = await payload.find({
          collection: 'properties',
          where,
          depth: 1,
          limit: 24,
          page,
          sort: dbSortField,
          select: {
            id: true,
            title: true,
            price: true,
            currency: true,
            listingStatus: true,
            views: true,
            location: true,
            propertyType: true,
            photos: true,
            seller_request: true,
          },
        })

        const { shouldRedirect, redirectToPage } = calculateValidPage({
          requestedPage: page,
          totalPages: result.totalPages || 1,
        })

        console.log('⚡ [PORTFOLIO TRACE]:', {
          requestedPage: page,
          returnedDocs: result.docs.length,
          totalDocs: result.totalDocs,
          totalPages: result.totalPages,
          shouldRedirect,
          redirectToPage,
        })

        return {
          docs: result.docs.map((doc): DashboardProperty => {
            // Slicing photos to only keep the primary image and reduce serialization payload sizes
            const primaryPhoto =
              doc.photos && doc.photos.length > 0 && typeof doc.photos[0] === 'object'
                ? {
                    url: doc.photos[0]?.url || null,
                    id: doc.photos[0]?.id ? String(doc.photos[0].id) : null,
                  }
                : null

            return {
              id: doc.id,
              title: doc.title,
              price: doc.price,
              currency: doc.currency,
              listingStatus:
                doc.listingStatus && typeof doc.listingStatus === 'object'
                  ? doc.listingStatus.slug
                  : typeof doc.listingStatus === 'string'
                    ? doc.listingStatus
                    : 'draft',
              listingStatusName:
                doc.listingStatus && typeof doc.listingStatus === 'object'
                  ? doc.listingStatus.name
                  : null,
              listingStatusColor:
                doc.listingStatus && typeof doc.listingStatus === 'object'
                  ? doc.listingStatus.colorTheme
                  : null,
              views: doc.views,
              location: doc.location
                ? {
                    address: doc.location.address
                      ? {
                          fullAddress: doc.location.address.fullAddress,
                          country: doc.location.address.country,
                          city: doc.location.address.city,
                          state: doc.location.address.state,
                          street: doc.location.address.street,
                        }
                      : null,
                  }
                : null,
              propertyType:
                doc.propertyType && typeof doc.propertyType === 'object'
                  ? {
                      name: doc.propertyType.name,
                    }
                  : null,
              photos: primaryPhoto ? [primaryPhoto] : [],
              sellerRequest: doc.seller_request
                ? typeof doc.seller_request === 'object'
                  ? doc.seller_request.id
                  : doc.seller_request
                : null,
            }
          }),
          totalDocs: result.totalDocs,
          totalPages: result.totalPages || 1,
          page: result.page || 1,
          shouldRedirect,
          redirectToPage,
        }
      },
      [cacheKey],
      {
        revalidate: 86400,
        tags: [`seller-properties-${sellerId}`],
      }
    )()
  }

  /**
   * Retrieves paginated requests for listing submittals.
   * Leverages unstable_cache and select options.
   */
  static async getSellerRequests(
    sellerId: string | number,
    page: number = 1
  ): Promise<SellerRequestsResponse> {
    const cacheKey = `seller-requests:${sellerId}:p${page}`

    return await unstable_cache(
      async (): Promise<SellerRequestsResponse> => {
        console.log(`⚡ [DB QUERY - REQUESTS]: Fetching requests. Key: ${cacheKey}`)
        const payload = await getPayloadClient()
        const result = await payload.find({
          collection: 'seller-requests',
          where: {
            seller: {
              equals: sellerId,
            },
          },
          limit: 10,
          page,
          sort: '-createdAt',
          depth: 1,
          select: {
            property_title: true,
            property_type: true,
            asking_price: true,
            currency: true,
            city: true,
            country: true,
            status: true,
            createdAt: true,
            publishedProperty: true,
          },
        })

        const { shouldRedirect, redirectToPage } = calculateValidPage({
          requestedPage: page,
          totalPages: result.totalPages || 1,
        })

        console.log('⚡ [REQUESTS TRACE]:', {
          requestedPage: page,
          returnedDocs: result.docs.length,
          totalDocs: result.totalDocs,
          totalPages: result.totalPages,
          shouldRedirect,
          redirectToPage,
        })

        return {
          docs: result.docs as unknown as DashboardSellerRequest[],
          totalDocs: result.totalDocs,
          totalPages: result.totalPages || 1,
          page: result.page || 1,
          shouldRedirect,
          redirectToPage,
        }
      },
      [cacheKey],
      {
        revalidate: 86400,
        tags: [`seller-requests-${sellerId}`],
      }
    )()
  }
}
