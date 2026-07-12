import { PropertyInquiry } from '@/components/property/property-inquiry'
import { PropertyProvider } from '@/components/providers/property'
import { PropertyDetails } from '@/components/property/details'
import { PropertyFeatures } from '@/components/property/features'
import { PropertyGallery } from '@/components/property/gallery'
import { PropertyMap } from '@/components/property/map'
import { PropertyOverview } from '@/components/property/overview'
import { ViewTracker } from '@/components/property/view-tracker'
import { OperationalMetrics } from '@/components/property/specs/OperationalMetrics'
import { permanentRedirect, notFound } from 'next/navigation'
import { SERVER_URL } from '@/env'
import { Suspense, cache } from 'react'
import { getCachedPropertyDetail } from '@/lib/cache/property-detail'
import { Skeleton } from '@/components/ui/skeleton'
import { buildPropertySlug } from '@/repository/property/generate-url'
import { getCachedCompanySettings } from '@/lib/cache/company-settings'
import { VisualizeButton } from '@/components/property/partner/visualize-button'
import { PartnerDesignTab } from '@/components/property/partner/partner-design-tab'
import { PropertyProjectSection } from '@/components/property/project-section'

type Params = Promise<{ id: string; slug: string }>

/**
 * Performance Optimization: Two-layer caching strategy.
 * 
 * Layer 1 (unstable_cache): Cross-request server cache (1 day safety net TTL, on-demand revalidation) — eliminates
 * repeated database round-trips for the same property across different visitors.
 * 
 * Layer 2 (React cache): Per-request dedup — prevents double queries between
 * generateMetadata and the page render within the same server request.
 * 
 * The ID is the Single Source of Truth for looking up property data.
 */
const getProperty = cache(async (id: string) => {
  return await getCachedPropertyDetail(id)
})

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params
  const property = await getProperty(id)
  const statusSlug =
    property && typeof property.original.listingStatus === 'object' && property.original.listingStatus
      ? property.original.listingStatus.slug
      : property && typeof property.original.listingStatus === 'string'
        ? property.original.listingStatus
        : 'draft'

  if (!property || statusSlug === 'draft') {
    return {
      title: 'Property Not Found',
      description: 'The requested property could not be found.',
    }
  }

  // Use the first photo as the primary OG image (raw URL from Media object)
  const primaryPhotoUrl =
    property.original.photos?.[0] &&
    typeof property.original.photos[0] === 'object' &&
    'url' in property.original.photos[0]
      ? (property.original.photos[0].url ?? null)
      : null

  return {
    metadataBase: new URL(SERVER_URL || 'http://localhost:3000'),
    alternates: {
      canonical: property.url,
    },
    title: property.original.location?.address?.fullAddress || property.title,
    description: property.description,
    openGraph: {
      url: property.url,
      title: property.original.location?.address?.fullAddress || property.title,
      description: property.description ?? undefined,
      type: 'website',
      images: primaryPhotoUrl
        ? [{ url: primaryPhotoUrl, width: 1200, height: 630, alt: property.title ?? 'Property' }]
        : [],
    },
  }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Params
}) {
  const { id, slug } = await params
  
  // Fetch using ID as primary lookup key.
  // The cache layer returns null for missing properties, so we guard explicitly.
  const property = await getProperty(id)

  const statusSlug =
    property && typeof property.original.listingStatus === 'object' && property.original.listingStatus
      ? property.original.listingStatus.slug
      : property && typeof property.original.listingStatus === 'string'
        ? property.original.listingStatus
        : 'draft'

  if (!property || statusSlug === 'draft') {
    notFound()
  }

  // Fetch CompanySettings to check if the Strategic Partner is active
  const companySettings = await getCachedCompanySettings()
  const partner = companySettings?.partner

  // Canonical URL Verification: Compare incoming slug with true slug derived from backend state.
  // IMPORTANT: Must use property.original.location?.address (raw data) NOT property.location,
  // because PropertyDecorator has no location getter — property.location would be undefined,
  // causing buildPropertySlug to only use street and never match the full canonical slug.
  const currentSlug = slug ? decodeURIComponent(slug) : ''
  const canonicalSlug = buildPropertySlug(
    property.original.location?.address || { street: property.original.street }
  )

  // Defensive check: If slug is empty, mismatched, or legacy, redirect to canonical property.url
  // Uses permanentRedirect (301) to preserve SEO integrity
  if (currentSlug !== canonicalSlug) {
    permanentRedirect(property.url)
  }

  // Get owner ID from property
  const ownerId =
    typeof property.original.seller === 'object'
      ? property.original.seller?.id
      : property.original.seller

  // Build Structured Data payload for SEO (Google Rich Results compliant)
  // IMPORTANT: All values here must be raw/canonical, NOT formatted display strings.
  // property.price is a formatted string (e.g. "$500,000") — use original.price (number) instead.
  const rawPrice = typeof property.original.price === 'number' ? property.original.price : null

  // Map listing status to Schema.org ItemAvailability
  // Only 'forsale' maps to InStock; all other statuses (pending, sold, offmarket, etc.) are OutOfStock


  const schemaAvailability =
    statusSlug === 'forsale'
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock'

  // Extract all photo URLs from Media objects, filtering nulls
  const schemaImages = (property.original.photos ?? [])
    .map((p) => (typeof p === 'object' && 'url' in p ? p.url : null))
    .filter((url): url is string => typeof url === 'string' && url.length > 0)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title || property.original.location?.address?.fullAddress,
    description: property.description,
    url: property.url,
    datePosted: property.original.createdAt,
    image: schemaImages,
    offers: {
      '@type': 'Offer',
      // Must be a number for Schema.org validation, not a formatted string
      ...(rawPrice !== null && { price: rawPrice, priceCurrency: property.original.currency || 'USD' }),
      availability: schemaAvailability,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.original.location?.address?.street,
      addressLocality: property.original.location?.address?.city,
      addressRegion: property.original.location?.address?.state,
      postalCode: property.original.location?.address?.zip,
      addressCountry: property.original.location?.address?.country || 'EG',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PropertyProvider property={property.original}>
        <ViewTracker propertyId={id} ownerId={ownerId} />
        <div className="w-full flex flex-col pt-32 pb-16 bg-slate-50/30">
          <div className="max-w-7xl w-full mx-auto px-4 flex flex-col gap-8">
            <div className="relative">
              <PropertyProjectSection />
              <PropertyGallery />
              <VisualizeButton partner={partner} constructionStatus={property.original.constructionStatus} />
            </div>

            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 desktop:col-span-8 flex flex-col gap-8">
                <PropertyDetails />
                <div className="flex flex-col gap-2">
                  <PropertyOverview />
                </div>

                {property.original.category === 'hospitality' && property.original.operationalData && (
                  <OperationalMetrics
                    operationalData={property.original.operationalData}
                    currency={property.original.currency}
                  />
                )}


                <Suspense
                  fallback={
                    <div className="w-full h-64 bg-white rounded-[32px] p-8 shadow-sm border border-navy-deep/5 flex flex-col gap-4">
                      <Skeleton className="h-8 w-1/4" />
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  }
                >
                  <PropertyFeatures />
                </Suspense>

                <Suspense
                  fallback={
                    <div className="w-full h-96 bg-white rounded-[32px] p-8 shadow-sm border border-navy-deep/5 flex flex-col gap-4">
                      <Skeleton className="h-8 w-1/4" />
                      <Skeleton className="h-full w-full rounded-2xl" />
                    </div>
                  }
                >
                  <PropertyMap />
                </Suspense>
              </div>

              <div className="col-span-12 desktop:col-span-4">
                <div className="sticky top-24 transition-all duration-300 flex flex-col gap-6">
                  <PropertyInquiry />
                  <PartnerDesignTab partner={partner} constructionStatus={property.original.constructionStatus} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PropertyProvider>
    </>
  )
}
