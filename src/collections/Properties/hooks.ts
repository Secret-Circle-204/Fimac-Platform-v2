import type {
  CollectionBeforeChangeHook,
  CollectionAfterReadHook,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeDeleteHook,
} from 'payload'
import type { Property, PropertyType, ListingStatus } from '@/payload-types'
import { triggerRevalidate } from '@/lib/cache/revalidate'
import { service } from '@/services'

import { buildFullAddress } from '@/lib/location/build-full-address'
import { normalizeAddress } from '@/lib/location/normalize-address'
import { generatePrimaryKey } from '@/lib/generate-primary-key'
import { measureAfterRead, measureBeforeChange } from '@/lib/diagnostics'
import { isValidCoordinate } from '@/lib/geo/is-valid-coordinate'
import { GOOGLE_MAPS_API_KEY } from '@/env'
import { resolveLocationInput } from '@/lib/location/resolve-location'
import { reverseGeocode } from '@/lib/location/reverse-geocode'
import { convertPriceToUSD } from '@/lib/currency/exchange-rates'

class CustomValidationError extends Error {
  status: number
  data: { errors: { message: string; field?: string }[] }

  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
    this.status = 400
    this.data = {
      errors: [
        { message, field: 'location.geo.lat' },
        { message, field: 'location.geo.lng' },
      ],
    }
  }
}

export const formatAddress: CollectionAfterReadHook<Property> = measureAfterRead(
  'formatAddress',
  async ({ doc }) => {
    const location_legacy =
      typeof doc.location_legacy === 'object' && doc.location_legacy !== null
        ? doc.location_legacy
        : null

    if (!location_legacy && !doc.location) {
      return doc
    }

    const city = doc.location?.address?.city || location_legacy?.city
    const state_abbr = doc.location?.address?.state || location_legacy?.state_abbr
    const state_name = doc.location?.address?.state || location_legacy?.state_name
    const zip = doc.location?.address?.zip || location_legacy?.zip
    const street = doc.location?.address?.street || doc.street

    const full_address =
      doc.location?.address?.fullAddress || `${street}, ${city}, ${state_abbr} ${zip}`

    return {
      ...doc,
      full_address,
      address: {
        street,
        city,
        state: state_name,
        state_abbr,
        zip,
        full_address,
      },
    }
  },
)

export const syncLocationHook: CollectionBeforeChangeHook<Property> = measureBeforeChange(
  'syncLocationHook',
  async ({ data, req, operation }) => {
    try {
      // DEBUG LOGGING - Auditing Auth Context
      console.log(
        `[PropertiesHook] Operation: ${operation}, Collection: properties, User: ${req.user ? `${req.user.email} (${req.user.collection})` : 'UNDEFINED'}`,
      )

      // 0. Server-side ID generation
      if (operation === 'create' && !data.id) {
        data.id = generatePrimaryKey(8)
      }

      let coordsModified = false
      let latVal: number | undefined = undefined
      let lngVal: number | undefined = undefined

      // 1. Handle Smart Helper Input
      if (data.mapsUrlInput) {
        const resolved = await resolveLocationInput(data.mapsUrlInput, GOOGLE_MAPS_API_KEY)

        if (resolved.geo && isValidCoordinate(resolved.geo.lat, resolved.geo.lng)) {
          latVal = resolved.geo.lat
          lngVal = resolved.geo.lng
          coordsModified = true

          // Clean up input helper
          data.mapsUrlInput = ''

          // Prepare location data if it doesn't exist
          if (!data.location) {
            data.location = {
              geo: { lat: latVal, lng: lngVal },
              address: { street: '', city: '', state: '', country: 'Egypt', zip: '' },
              meta: {
                source: resolved.address ? 'google_maps' : 'manual',
                extractedAt: new Date().toISOString(),
                extractionConfidence: resolved.confidence,
              },
            }
          } else {
            data.location.geo = { lat: latVal, lng: lngVal }
            data.location.meta = {
              ...(data.location.meta || {}),
              source: resolved.address ? 'google_maps' : 'manual',
              extractedAt: new Date().toISOString(),
              extractionConfidence: resolved.confidence,
            }
          }

          // If the helper resolved coordinates AND pre-extracted structured address details:
          if (resolved.address) {
            data.location.address = {
              street: resolved.address.street || resolved.streetHint || '',
              city: resolved.address.city || '',
              state: resolved.address.state || '',
              country: resolved.address.country || 'Egypt',
              zip: resolved.address.zip || '',
            }
          } else {
            // If no address was pre-extracted, trigger reverse-geocoding to populate address details
            const geocodedAddress = await reverseGeocode(latVal, lngVal, GOOGLE_MAPS_API_KEY)
            if (geocodedAddress) {
              data.location.address = {
                street: geocodedAddress.street || resolved.streetHint || '',
                city: geocodedAddress.city || '',
                state: geocodedAddress.state || '',
                country: geocodedAddress.country || 'Egypt',
                zip: geocodedAddress.zip || '',
              }

              // If the geocoded street contains Arabic characters but we have an English streetHint, prefer the English hint
              const hasArabic = /[\u0600-\u06FF]/.test(data.location.address.street)
              if (
                hasArabic &&
                resolved.streetHint &&
                !/[\u0600-\u06FF]/.test(resolved.streetHint)
              ) {
                data.location.address.street = resolved.streetHint
              }
            }
          }
        } else {
          console.warn(
            `[PropertiesHook] Smart Location Helper failed to resolve input: "${data.mapsUrlInput}". Error: ${resolved.error}`,
          )
        }
      }

      // 2. Swapping Correction & Manual Coordinates Changes
      // If coordinates were not modified via helper, check if they are manually modified in payload
      if (!coordsModified && data.location?.geo) {
        const { lat, lng } = data.location.geo
        if (lat !== undefined && lng !== undefined && lat !== null && lng !== null) {
          latVal = Number(lat)
          lngVal = Number(lng)

          if (isValidCoordinate(latVal, lngVal)) {
            coordsModified = true
          }
        }
      }

      // Apply Smart Swapping Detection if coordinates are modified and present
      if (coordsModified && latVal !== undefined && lngVal !== undefined) {
        // Egypt bounding box swapping correction:
        // Egypt Latitude is 22 to 31.8. Longitude is 25 to 37.
        // If latitude is between 32.0 and 37.0 and longitude is between 22.0 and 31.8, they are swapped.
        if (latVal > 31.8 && latVal <= 37.0 && lngVal >= 22.0 && lngVal <= 31.8) {
          console.log(
            `[PropertiesHook] Swapping coordinates to correct admin error: (${latVal}, ${lngVal}) -> (${lngVal}, ${latVal})`,
          )
          const temp = latVal
          latVal = lngVal
          lngVal = temp

          // Update in data
          if (data.location) {
            data.location.geo = { lat: latVal, lng: lngVal }
          }
        }

        // Check if address components are completely empty (manual coordinate entry without address details)
        if (data.location?.address) {
          const { street, city, state } = data.location.address
          const hasNoAddress = !street && !city && !state
          if (hasNoAddress) {
            const geocodedAddress = await reverseGeocode(latVal, lngVal, GOOGLE_MAPS_API_KEY)
            if (geocodedAddress) {
              data.location.address = {
                street: geocodedAddress.street || '',
                city: geocodedAddress.city || '',
                state: geocodedAddress.state || '',
                country: geocodedAddress.country || 'Egypt',
                zip: geocodedAddress.zip || '',
              }
            }
          }
        }
      }

      // 3. Sanitize manually-entered geo: reject invalid values before they reach the DB
      if (data.location?.geo) {
        const { lat, lng } = data.location.geo
        if (lat !== undefined && lng !== undefined && lat !== null && lng !== null) {
          if (!isValidCoordinate(lat, lng)) {
            throw new CustomValidationError(
              `Invalid Geolocation: Latitude (${lat}) and Longitude (${lng}) are not valid coordinates.`,
            )
          }
        }
      }

      // 4. Auto-generate Search Slugs and Full Address
      if (data.location?.address) {
        const { street = '', city = '', state = '', zip = '' } = data.location.address
        if (street || city || state) {
          data.location.address.fullAddress = buildFullAddress(
            street,
            city,
            state,
            zip || undefined,
          )
          data.location.search = normalizeAddress(street, city, state, zip || undefined)
        }
      }

      // 5. Keep legacy 'street' in sync
      if (data.location?.address?.street) {
        data.street = data.location.address.street
      }

      // 6. Calculate basePriceInUSD for multi-currency pricing
      if (data.price !== undefined && data.price !== null) {
        const currency = data.currency || 'EGP'
        data.basePriceInUSD = await convertPriceToUSD(Number(data.price), currency)
      } else {
        data.basePriceInUSD = null
      }
      // 7. Sync propertyTypeSlug for conditional field logic
      if (data.propertyType) {
        const propertyTypeId =
          typeof data.propertyType === 'object' && data.propertyType !== null
            ? (data.propertyType as PropertyType).id
            : data.propertyType

        if (propertyTypeId) {
          try {
            const pType = await req.payload.findByID({
              collection: 'property-types',
              id: propertyTypeId,
              depth: 0,
            })
            if (pType && pType.slug) {
              data.propertyTypeSlug = pType.slug
            }
          } catch (err) {
            req.payload.logger.error(
              `Error resolving propertyType slug: ${err instanceof Error ? err.message : 'Unknown'}`,
            )
          }
        }
      } else {
        data.propertyTypeSlug = ''
      }
    } catch (error) {
      if (error instanceof CustomValidationError) {
        throw error // Re-throw validation errors so they map directly to the fields in the UI
      }
      req.payload.logger.error(
        `[PropertiesHook] CRITICAL ERROR in syncLocationHook: ${error instanceof Error ? error.message : 'Unknown'}`,
      )
      // Intentionally swallow other non-validation errors so property save transaction is never blocked
    }

    return data
  },
)

import { didFeaturedPresentationChange, didFilterUniverseChange, getRelationSlug } from './diff'
import { getCachedListingStatuses } from '@/lib/cache/listing-statuses'
import { getCachedConstructionStatuses } from '@/lib/cache/construction-statuses'

const isActiveSearchable = (
  doc: Partial<Property> | undefined | null,
  listingStatuses: ListingStatus[]
): boolean => {
  if (!doc) return false
  const statusField = doc.listingStatus
  if (!statusField) return false

  if (typeof statusField === 'object' && statusField !== null && 'slug' in statusField) {
    const obj = statusField as { slug: unknown }
    return typeof obj.slug === 'string' && obj.slug !== 'draft'
  }

  const status = listingStatuses.find((s) => {
    if (s && typeof s === 'object' && 'id' in s) {
      const obj = s as { id: unknown }
      return String(obj.id) === String(statusField)
    }
    return false
  })

  if (status && typeof status === 'object' && 'slug' in status) {
    const obj = status as { slug: unknown }
    return typeof obj.slug === 'string' && obj.slug !== 'draft'
  }

  return false
}

export const revalidatePropertyCache: CollectionAfterChangeHook<Property> = async ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  if (context?.skipCacheInvalidation) return
  try {
    const id = doc?.id || previousDoc?.id
    if (id) {
      // 1. Always invalidate the specific property cache tag.
      // This will instantly evict the detail page AND any cached search page containing this property!
      triggerRevalidate(`property:${id}`)

      // 2. Fetch the listing/construction status arrays to map relationship IDs to slugs
      const [listingStatuses, constructionStatuses] = await Promise.all([
        getCachedListingStatuses().catch(() => []),
        getCachedConstructionStatuses().catch(() => []),
      ])

      const getListingStatusSlug = (idOrObj: unknown): string | null => {
        if (!idOrObj) return null
        if (typeof idOrObj === 'object' && idOrObj !== null && 'slug' in idOrObj) {
          const obj = idOrObj as { slug: unknown }
          return typeof obj.slug === 'string' ? obj.slug : null
        }
        const status = listingStatuses.find((s) => {
          if (s && typeof s === 'object' && 'id' in s) {
            const obj = s as { id: unknown }
            return String(obj.id) === String(idOrObj)
          }
          return false
        })
        if (status && typeof status === 'object' && 'slug' in status) {
          const obj = status as { slug: unknown }
          return typeof obj.slug === 'string' ? obj.slug : null
        }
        return null
      }

      const getConstructionStatusSlug = (idOrObj: unknown): string | null => {
        if (!idOrObj) return null
        if (typeof idOrObj === 'object' && idOrObj !== null && 'slug' in idOrObj) {
          const obj = idOrObj as { slug: unknown }
          return typeof obj.slug === 'string' ? obj.slug : null
        }
        const status = constructionStatuses.find((s) => {
          if (s && typeof s === 'object' && 'id' in s) {
            const obj = s as { id: unknown }
            return String(obj.id) === String(idOrObj)
          }
          return false
        })
        if (status && typeof status === 'object' && 'slug' in status) {
          const obj = status as { slug: unknown }
          return typeof obj.slug === 'string' ? obj.slug : null
        }
        return null
      }

      const getCity = (d: Partial<Property> | undefined | null) => d?.location?.address?.city || null
      const getCategory = (d: Partial<Property> | undefined | null) => d?.category || null
      const getPropertyTypeSlug = (d: Partial<Property> | undefined | null) => getRelationSlug(d?.propertyType) || d?.propertyTypeSlug || null

      // 3. Diff check for Featured Properties
      if (didFeaturedPresentationChange(previousDoc, doc)) {
        triggerRevalidate('featured-properties')
      }

      // 4. Diff check for Search Filters
      if (didFilterUniverseChange(previousDoc, doc)) {
        triggerRevalidate('search-filters')
      }

      // 5. Invalidate property types cache only if the property transitions between active/inactive
      // or if it remains active but its property type changes.
      const wasActive = isActiveSearchable(previousDoc, listingStatuses)
      const isActive = isActiveSearchable(doc, listingStatuses)

      const activeStatusShifted = wasActive !== isActive
      const activePropertyTypeChanged = wasActive && isActive && (getPropertyTypeSlug(previousDoc) !== getPropertyTypeSlug(doc))

      if (activeStatusShifted || activePropertyTypeChanged) {
        triggerRevalidate('property-types-active')
      }

      // 6. Granular Search Results Invalidation
      // We always trigger broad 'search-results:all' to refresh unfiltered queries.
      triggerRevalidate('search-results:all')

      // If it's a create, delete, or critical search parameters changed, we invalidate specific tags:
      const isCreateOrDelete = !previousDoc || !doc
      const criticalFilterChanged = didFilterUniverseChange(previousDoc, doc) || 
                                    getPropertyTypeSlug(previousDoc) !== getPropertyTypeSlug(doc)

      if (isCreateOrDelete || criticalFilterChanged) {
        // Collect all distinct cities/types/categories/listing statuses/construction statuses affected
        const affectedCities = new Set<string>()
        const affectedTypes = new Set<string>()
        const affectedCategories = new Set<string>()
        const affectedListings = new Set<string>()
        const affectedConstructions = new Set<string>()

        if (previousDoc) {
          const city = getCity(previousDoc)
          if (city) affectedCities.add(city.toLowerCase())
          const type = getPropertyTypeSlug(previousDoc)
          if (type) affectedTypes.add(type.toLowerCase())
          const cat = getCategory(previousDoc)
          if (cat) affectedCategories.add(cat.toLowerCase())
          const list = getListingStatusSlug(previousDoc.listingStatus)
          if (list) affectedListings.add(list.toLowerCase())
          const cons = getConstructionStatusSlug(previousDoc.constructionStatus)
          if (cons) affectedConstructions.add(cons.toLowerCase())
        }

        if (doc) {
          const city = getCity(doc)
          if (city) affectedCities.add(city.toLowerCase())
          const type = getPropertyTypeSlug(doc)
          if (type) affectedTypes.add(type.toLowerCase())
          const cat = getCategory(doc)
          if (cat) affectedCategories.add(cat.toLowerCase())
          const list = getListingStatusSlug(doc.listingStatus)
          if (list) affectedListings.add(list.toLowerCase())
          const cons = getConstructionStatusSlug(doc.constructionStatus)
          if (cons) affectedConstructions.add(cons.toLowerCase())
        }

        // Trigger granular invalidation for all affected tags
        affectedCities.forEach(city => triggerRevalidate(`search-results:city:${city}`))
        affectedTypes.forEach(type => triggerRevalidate(`search-results:type:${type}`))
        affectedCategories.forEach(cat => triggerRevalidate(`search-results:category:${cat}`))
        affectedListings.forEach(list => triggerRevalidate(`search-results:listing:${list}`))
        affectedConstructions.forEach(cons => triggerRevalidate(`search-results:construction:${cons}`))
      }
    }

    const getSellerId = (seller: unknown) => {
      if (seller && typeof seller === 'object' && 'id' in seller)
        return (seller as { id: string | number }).id
      return seller as string | number | undefined | null
    }

    const currentSellerId = getSellerId(doc?.seller)
    const previousSellerId = getSellerId(previousDoc?.seller)

    if (currentSellerId) {
      triggerRevalidate(`seller-properties-${currentSellerId}`)
    }
    if (previousSellerId && previousSellerId !== currentSellerId) {
      triggerRevalidate(`seller-properties-${previousSellerId}`)
    }

    if (currentSellerId !== previousSellerId) {
      if (previousSellerId) {
        await service.sellerCounter.decrement(previousSellerId, req)
      }

      if (currentSellerId) {
        await service.sellerCounter.increment(currentSellerId, req)
      }
    }
  } catch (err) {
    console.error('[CacheRevalidation] Error during revalidation:', err)
  }
}

export const revalidatePropertyDeleteCache: CollectionAfterDeleteHook<Property> = async ({
  doc,
  req,
  context,
}) => {
  if (context?.skipCacheInvalidation) return
  try {
    const id = doc?.id
    if (id) {
      triggerRevalidate(`property:${id}`)

      const [listingStatuses, constructionStatuses] = await Promise.all([
        getCachedListingStatuses().catch(() => []),
        getCachedConstructionStatuses().catch(() => []),
      ])

      const getListingStatusSlug = (idOrObj: unknown): string | null => {
        if (!idOrObj) return null
        if (typeof idOrObj === 'object' && idOrObj !== null && 'slug' in idOrObj) {
          const obj = idOrObj as { slug: unknown }
          return typeof obj.slug === 'string' ? obj.slug : null
        }
        const status = listingStatuses.find((s) => {
          if (s && typeof s === 'object' && 'id' in s) {
            const obj = s as { id: unknown }
            return String(obj.id) === String(idOrObj)
          }
          return false
        })
        if (status && typeof status === 'object' && 'slug' in status) {
          const obj = status as { slug: unknown }
          return typeof obj.slug === 'string' ? obj.slug : null
        }
        return null
      }

      const getConstructionStatusSlug = (idOrObj: unknown): string | null => {
        if (!idOrObj) return null
        if (typeof idOrObj === 'object' && idOrObj !== null && 'slug' in idOrObj) {
          const obj = idOrObj as { slug: unknown }
          return typeof obj.slug === 'string' ? obj.slug : null
        }
        const status = constructionStatuses.find((s) => {
          if (s && typeof s === 'object' && 'id' in s) {
            const obj = s as { id: unknown }
            return String(obj.id) === String(idOrObj)
          }
          return false
        })
        if (status && typeof status === 'object' && 'slug' in status) {
          const obj = status as { slug: unknown }
          return typeof obj.slug === 'string' ? obj.slug : null
        }
        return null
      }

      const getCity = (d: Partial<Property> | undefined | null) => d?.location?.address?.city || null
      const getCategory = (d: Partial<Property> | undefined | null) => d?.category || null
      const getPropertyTypeSlug = (d: Partial<Property> | undefined | null) => getRelationSlug(d?.propertyType) || d?.propertyTypeSlug || null

      triggerRevalidate('featured-properties')
      triggerRevalidate('search-filters')
      triggerRevalidate('search-results:all')

      // Invalidate property types only if the deleted property was active/searchable
      if (isActiveSearchable(doc, listingStatuses)) {
        triggerRevalidate('property-types-active')
      }

      const city = getCity(doc)
      const type = getPropertyTypeSlug(doc)
      const cat = getCategory(doc)
      const list = getListingStatusSlug(doc.listingStatus)
      const cons = getConstructionStatusSlug(doc.constructionStatus)

      if (city) triggerRevalidate(`search-results:city:${city.toLowerCase()}`)
      if (type) triggerRevalidate(`search-results:type:${type.toLowerCase()}`)
      if (cat) triggerRevalidate(`search-results:category:${cat.toLowerCase()}`)
      if (list) triggerRevalidate(`search-results:listing:${list.toLowerCase()}`)
      if (cons) triggerRevalidate(`search-results:construction:${cons.toLowerCase()}`)
    }

    const getSellerId = (seller: unknown) => {
      if (seller && typeof seller === 'object' && 'id' in seller)
        return (seller as { id: string | number }).id
      return seller as string | number | undefined | null
    }

    const sellerId = getSellerId(doc?.seller)
    if (sellerId) {
      triggerRevalidate(`seller-properties-${sellerId}`)
      await service.sellerCounter.decrement(sellerId, req)
    }
  } catch (err) {
    console.error('[CacheRevalidation] Error during delete revalidation:', err)
  }
}


export const deleteAssociatedPropertyData: CollectionBeforeDeleteHook = async ({ req, id }) => {
  try {
    // 1. Find the property being deleted to check if it has a linked seller request
    const propertyDoc = await req.payload.findByID({
      collection: 'properties',
      id,
      depth: 0,
    })

    if (propertyDoc && propertyDoc.seller_request) {
      const sellerReqId =
        typeof propertyDoc.seller_request === 'object' && propertyDoc.seller_request !== null
          ? propertyDoc.seller_request.id
          : propertyDoc.seller_request

      await req.payload.update({
        collection: 'seller-requests',
        id: sellerReqId,
        data: {
          status: 'rejected',
        },
      })
    }
  } catch (err) {
    req.payload.logger.error(
      { err },
      `[PropertiesHook] Failed to reject associated seller request for property ${id}`,
    )
  }

  try {
    // Delete all property views associated with this property to satisfy foreign key constraints
    await req.payload.delete({
      collection: 'property-views',
      where: {
        property: {
          equals: id,
        },
      },
    })
  } catch (err) {
    req.payload.logger.error(
      { err },
      `[PropertiesHook] Failed to delete associated views for property ${id}`,
    )
  }
}

export const swapSortOrderHook: CollectionBeforeChangeHook<Property> = measureBeforeChange(
  'swapSortOrderHook',
  async ({ data, req, originalDoc, operation: _operation }) => {
    // 1. Prevent recursion by checking custom context flag
    if (req.context && (req.context as Record<string, unknown>).disableSortSwap) {
      return data
    }

    const newSortOrder = data?.sortOrder
    const oldSortOrder = originalDoc?.sortOrder

    // 2. We only execute swap if a sortOrder exists, is modified, and is not the unassigned value (99999)
    if (
      newSortOrder !== undefined &&
      newSortOrder !== null &&
      newSortOrder !== 99999 &&
      newSortOrder !== oldSortOrder
    ) {
      try {
        // Find if there is an existing property that already has this sortOrder
        const duplicateProperties = await req.payload.find({
          collection: 'properties',
          where: {
            and: [
              { sortOrder: { equals: newSortOrder } },
              originalDoc?.id ? { id: { not_equals: originalDoc.id } } : {},
            ],
          },
          limit: 1,
          depth: 0,
          req,
        })

        const duplicateProperty = duplicateProperties.docs?.[0]

        if (duplicateProperty) {
          req.payload.logger.info(
            `[SortOrderSwap] Swapping sortOrder ${newSortOrder} with old value ${oldSortOrder || 99999} between properties.`,
          )

          // Set the context flag to prevent infinite recursion
          req.context = req.context || {}
          ;(req.context as Record<string, unknown>).disableSortSwap = true

          // Update the duplicate property to take the old sortOrder (or 99999 if it was unassigned)
          await req.payload.update({
            collection: 'properties',
            id: duplicateProperty.id,
            data: {
              sortOrder: oldSortOrder || 99999,
            },
            req, // propagate context to the nested update request
          })
        }
      } catch (err) {
        req.payload.logger.error(
          `[SortOrderSwap] Failed to execute sorting swap: ${err instanceof Error ? err.message : 'Unknown'}`,
        )
      }
    }

    return data
  },
)
