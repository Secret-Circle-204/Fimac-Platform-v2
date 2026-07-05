import { local } from '@/repository'
import type { Where } from 'payload'
import { geocodeSearch } from '@/lib/location/geocode-search'
import { SearchHeader } from '@/components/search/search-header'
import { SearchResultsWrapper } from '@/components/search/search-results-wrapper'
import { NewsLetter } from '@/components/shared/newsletter'
import { getCachedPropertyTypes } from '@/lib/cache/property-types'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getCachedSearchFilters } from '@/lib/cache/search-filters'
import { getCachedSearchResults, buildSearchCacheKey } from '@/lib/cache/search-results'

export const metadata = {
  title: 'Search Properties | Fimac Group',
  description: 'Search and filter hospitality investment properties',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const user = await getCurrentUser()
  const resolvedParams = await searchParams
  const location = typeof resolvedParams.location === 'string' ? resolvedParams.location : ''
  const lat = typeof resolvedParams.lat === 'string' ? parseFloat(resolvedParams.lat) : null
  const lng = typeof resolvedParams.lng === 'string' ? parseFloat(resolvedParams.lng) : null
  const radius = typeof resolvedParams.radius === 'string' ? parseFloat(resolvedParams.radius) : 50

  const type = typeof resolvedParams.type === 'string' ? resolvedParams.type : 'all'
  const country = typeof resolvedParams.country === 'string' ? resolvedParams.country : 'all'
  const state = typeof resolvedParams.state === 'string' ? resolvedParams.state : 'all'
  const city = typeof resolvedParams.city === 'string' ? resolvedParams.city : 'all'
  const quickPrice =
    typeof resolvedParams.quickPrice === 'string' ? resolvedParams.quickPrice : 'all'

  // Fetch properties with server-side filtering
  const andConditions: Where[] = [
    {
      listingStatus: {
        equals: 'forsale',
      },
    },
  ]

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
        { 'location.address.country': { contains: country } },
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
        contains: state,
      },
    })
  }

  // City Filter
  if (city !== 'all') {
    andConditions.push({
      'location.address.city': {
        contains: city, // Case-insensitive exact word containment
      },
    })
  }

  // Quick Price Filter (Mapping to numeric ranges)
  if (quickPrice !== 'all') {
    if (quickPrice === '0-1m') {
      andConditions.push({ price: { less_than: 1000000 } })
    } else if (quickPrice === '1m-3m') {
      andConditions.push({ price: { greater_than_equal: 1000000, less_than: 3000000 } })
    } else if (quickPrice === '3m-5m') {
      andConditions.push({ price: { greater_than_equal: 3000000, less_than: 5000000 } })
    } else if (quickPrice === '5m-10m') {
      andConditions.push({ price: { greater_than_equal: 5000000, less_than: 10000000 } })
    } else if (quickPrice === '10m+') {
      andConditions.push({ price: { greater_than_equal: 10000000 } })
    }
  }

  // Parallelize independent queries: location lookup + property types + geocoding + search filters
  const [locationIds, typesData, geoBox, searchFilters] = await Promise.all([
    // Location lookup (returns empty array if no location filter)
    location
      ? local.location
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
            },
          )
          .then((locs) => locs.map((l) => l.id))
      : Promise.resolve([] as (string | number)[]),
    getCachedPropertyTypes(),
    location ? geocodeSearch(location) : Promise.resolve(null),
    getCachedSearchFilters(),
  ])

  const { countryOptions, stateOptions, cityOptions } = searchFilters

  // Location / Spatial Filter — now uses pre-resolved locationIds & geoBox
  if (location) {
    const orConditions: Where[] = [
      { title: { contains: location } },
      { 'location.address.city': { contains: location } },
      { 'location.address.state': { contains: location } },
      { 'location.address.zip': { contains: location } },
      ...(locationIds.length > 0 ? [{ location_legacy: { in: locationIds } }] : []),
    ]

    // If geocoding resolved a valid bounding box, match properties within this bounding box
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
    // Radius search using bounding box approximation
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

  const where: Where = {
    and: andConditions,
  }

  // Build deterministic cache key from current search parameters
  const cacheKey = buildSearchCacheKey({
    location,
    type,
    country,
    state,
    city,
    quickPrice,
    ...(lat !== null && { lat: String(lat) }),
    ...(lng !== null && { lng: String(lng) }),
    ...(radius !== 50 && { radius: String(radius) }),
  })

  const searchResults = await getCachedSearchResults(where, cacheKey)
  const properties = searchResults.docs

  const propertyTypeOptions = typesData.map((t) => ({
    label: t.name,
    value: t.slug,
  }))

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-[#FDFCFB]">
        {/* Page Header - Premium Luxury Theme */}
        <section className="bg-navy-deep pt-32 pb-32 relative overflow-hidden rounded-b-[40px] shadow-2xl z-20">
          <div className="absolute inset-0 bg-[url('/bg-gold.png')] opacity-10 bg-cover bg-center mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-brand-light via-blue-brand/90 to-blue-brand-light/95" />
          <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-royal mb-6 border border-gold-royal/30 px-5 py-2 rounded-full bg-gold-royal/10 backdrop-blur-md shadow-gold">
              Global Portfolio
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tight leading-tight">
              Discover{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold-royal to-gold-dark">
                Extraordinary
              </span>
            </h1>
            <p className="text-white/60 max-w-2xl text-base md:text-lg font-medium leading-relaxed">
              Explore our curated collection of exclusive hospitality and residential investment
              opportunities across the globe.
            </p>
          </div>
        </section>
        
        {/* Search Bar Section - Floating & Sticky Effect */}
        <div className="sticky top-[80px] z-40 lg:relative lg:top-auto lg:z-30 container mx-auto px-4 -mt-16 mb-8">
          <SearchHeader
            propertyTypeOptions={propertyTypeOptions}
            cityOptions={cityOptions}
            stateOptions={stateOptions}
            countryOptions={countryOptions}
          />
        </div>

        {/* Main Content Grid - Contained for Elite Alignment */}
        <section className="flex-1 w-full bg-[#FDFCFB] py-10">
          <div className="container mx-auto px-4 h-full">
            <div className="w-full lg:rounded-3xl lg:overflow-hidden lg:border lg:border-navy-deep/5 lg:shadow-2xl lg:bg-white h-full">
              <SearchResultsWrapper properties={properties} />
            </div>
          </div>
        </section>
        <NewsLetter user={user} />
      </main>
    </div>
  )
}
