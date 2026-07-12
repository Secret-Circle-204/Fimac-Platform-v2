import { local } from '@/repository'
import { buildPropertySearchQuery } from '@/repository/property/query-builder'
// geocodeSearch removed to prevent rate limiting
import { SearchHeader } from '@/components/search/search-header'
import { SearchResultsWrapper } from '@/components/search/search-results-wrapper'
import { NewsLetter } from '@/components/shared/newsletter'
import { getCachedPropertyTypes } from '@/lib/cache/property-types'
import { getCachedListingStatuses } from '@/lib/cache/listing-statuses'
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
  const lat = typeof resolvedParams.lat === 'string' ? parseFloat(resolvedParams.lat) : undefined
  const lng = typeof resolvedParams.lng === 'string' ? parseFloat(resolvedParams.lng) : undefined
  const radius = typeof resolvedParams.radius === 'string' ? parseFloat(resolvedParams.radius) : 50

  const type = typeof resolvedParams.type === 'string' ? resolvedParams.type : 'all'
  const country = typeof resolvedParams.country === 'string' ? resolvedParams.country : 'all'
  const city = typeof resolvedParams.city === 'string' ? resolvedParams.city : 'all'
  const quickPrice =
    typeof resolvedParams.quickPrice === 'string' ? resolvedParams.quickPrice : 'all'
  const listingStatus = typeof resolvedParams.listingStatus === 'string' ? resolvedParams.listingStatus : 'all'
  const constructionStatus = typeof resolvedParams.constructionStatus === 'string' ? resolvedParams.constructionStatus : 'all'
  const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : '-createdAt'
  const bedrooms = typeof resolvedParams.bedrooms === 'string' ? parseInt(resolvedParams.bedrooms) || 0 : 0
  const bathrooms = typeof resolvedParams.bathrooms === 'string' ? parseInt(resolvedParams.bathrooms) || 0 : 0

  // Parallelize independent queries: location lookup + property types + listing statuses + search filters
  const [locationIds, typesData, listingStatusesData, searchFilters] = await Promise.all([
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
    getCachedListingStatuses(),
    getCachedSearchFilters(),
  ])

  const { countryOptions, cityOptions } = searchFilters

  const listingStatusOptions = listingStatusesData
    .filter((status) => status.slug !== 'draft')
    .map((status) => ({
      label: status.name,
      value: status.slug,
    }))

  const page = typeof resolvedParams.page === 'string' ? Math.max(1, parseInt(resolvedParams.page) || 1) : 1

  const where = buildPropertySearchQuery({
    location,
    lat,
    lng,
    radius,
    type,
    country,
    city,
    quickPrice,
    listingStatus,
    constructionStatus,
    bedrooms,
    bathrooms,
    locationIds,
  })

  // Build deterministic cache key from current search parameters
  const cacheKey = buildSearchCacheKey({
    location,
    type,
    country,
    city,
    quickPrice,
    listingStatus,
    constructionStatus,
    ...(bedrooms > 0 && { bedrooms: String(bedrooms) }),
    ...(bathrooms > 0 && { bathrooms: String(bathrooms) }),
    ...(lat !== null && { lat: String(lat) }),
    ...(lng !== null && { lng: String(lng) }),
    ...(radius !== 50 && { radius: String(radius) }),
  })

  const searchResults = await getCachedSearchResults(where, cacheKey, page, sort)
  const properties = searchResults.docs
  const totalCount = searchResults.totalDocs

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
            listingStatusOptions={listingStatusOptions}
            cityOptions={cityOptions}
            countryOptions={countryOptions}
          />
        </div>

        {/* Main Content Grid - Contained for Elite Alignment */}
        <section className="flex-1 w-full bg-[#FDFCFB] py-10">
          <div className="container mx-auto px-4 h-full">
            <div className="w-full lg:rounded-3xl lg:overflow-hidden lg:border lg:border-navy-deep/5 lg:shadow-2xl lg:bg-white h-full">
              <SearchResultsWrapper
                properties={properties}
                totalCount={totalCount}
                currentPage={page}
              />
            </div>
          </div>
        </section>
        <NewsLetter user={user} />
      </main>
    </div>
  )
}
