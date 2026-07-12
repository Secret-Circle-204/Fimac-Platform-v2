import { requireSeller } from '@/lib/auth/get-current-user'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/db/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { sql } from '@payloadcms/db-postgres'

import { Button } from '@/components/ui/button'
import { Building2, Eye, TrendingUp, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { SellerPortfolioClient } from './portfolio-client'
import type { SiblingProperty } from './portfolio-client'
import { getCachedPropertyTypes } from '@/lib/cache/property-types'
import { getCachedListingStatuses } from '@/lib/cache/listing-statuses'
import { SellerDashboardRepository, DashboardSellerRequest } from '@/repository/dashboard/seller-dashboard-repository'
import { SellerRequestsClient } from './requests-client'

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const dynamic = 'force-dynamic'

export default async function SellerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  let user
  try {
    user = await requireSeller()
  } catch (error) {
    console.error('❌ Auth error in seller dashboard:', error)
    redirect('/auth/login')
  }

  const resolvedParams = await searchParams
  const location = typeof resolvedParams.location === 'string' ? resolvedParams.location : ''
  const lat = typeof resolvedParams.lat === 'string' ? parseFloat(resolvedParams.lat) : null
  const lng = typeof resolvedParams.lng === 'string' ? parseFloat(resolvedParams.lng) : null
  const radius = typeof resolvedParams.radius === 'string' ? parseFloat(resolvedParams.radius) : 50

  const type = typeof resolvedParams.type === 'string' ? resolvedParams.type : 'all'
  const country = typeof resolvedParams.country === 'string' ? resolvedParams.country : 'all'
  const state = typeof resolvedParams.state === 'string' ? resolvedParams.state : 'all'
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : 'all'
  const city = typeof resolvedParams.city === 'string' ? resolvedParams.city : 'all'

  let properties: SiblingProperty[] = []
  let sellerRequests: DashboardSellerRequest[] = []
  let propertyTypeOptions: Array<{ label: string; value: string }> = []
  let listingStatusOptions: Array<{ label: string; value: string }> = []
  let countryOptions: Array<{ label: string; value: string }> = []
  let stateOptions: Array<{ label: string; value: string }> = []
  let cityOptions: Array<{ label: string; value: string }> = []
  let resultPagination = {
    page: 1,
    totalPages: 1,
    totalDocs: 0,
  }
  let requestsPagination = {
    page: 1,
    totalPages: 1,
    totalDocs: 0,
  }
  let stats = {
    totalProperties: 0,
    totalViews: 0,
    activeListings: 0,
  }

  try {
    const payload = await getPayloadClient()

    // 1. Fetch overall analytics stats (unfiltered for this seller) using direct SQL aggregation
    const db = payload.db.drizzle
     const statsQueryRaw = await db.execute(
      sql`SELECT 
            COUNT(*) FILTER (WHERE listing_status_id IN (SELECT id FROM listing_statuses WHERE slug IN ('forsale', 'for-sale', 'sold')))::int as total_properties,
            COALESCE(SUM(views) FILTER (WHERE listing_status_id IN (SELECT id FROM listing_statuses WHERE slug IN ('forsale', 'for-sale', 'sold'))), 0)::int as total_views,
            COUNT(*) FILTER (WHERE listing_status_id IN (SELECT id FROM listing_statuses WHERE slug IN ('forsale', 'for-sale')))::int as active_listings
          FROM properties 
          WHERE seller_id = ${Number(user.id)}`
    )

    let totalProperties = 0
    let totalViews = 0
    let activeListings = 0

    const row = Array.isArray(statsQueryRaw) ? statsQueryRaw[0] : (statsQueryRaw.rows ? statsQueryRaw.rows[0] : null)
    if (row) {
      const typedRow = row as { total_properties?: number; total_views?: number; active_listings?: number }
      totalProperties = typedRow.total_properties || 0
      totalViews = typedRow.total_views || 0
      activeListings = typedRow.active_listings || 0
    }

    stats = {
      totalProperties,
      totalViews,
      activeListings,
    }

    // 2. Fetch Property Type & Listing Status Options
    const [typesData, listingStatuses] = await Promise.all([
      getCachedPropertyTypes(),
      getCachedListingStatuses(),
    ])
    propertyTypeOptions = typesData.map((t) => ({
      label: t.name,
      value: t.slug,
    }))
    listingStatusOptions = listingStatuses
      .filter((status) => status.slug === 'forsale' || status.slug === 'for-sale' || status.slug === 'sold')
      .map((status) => ({
        label: (status.slug === 'forsale' || status.slug === 'for-sale') ? 'Open Contract' : 'Closed Contract',
        value: status.slug,
      }))

    // 2.5 Extract unique active countries, states, and cities for this seller using direct SQL SELECT DISTINCT
    const locationsQuery = await db.execute(
      sql`SELECT DISTINCT 
            COALESCE(location_address_country, 'Egypt') as country,
            location_address_state as state,
            location_address_city as city
          FROM properties 
          WHERE seller_id = ${Number(user.id)}`
    )

    const locationRows = Array.isArray(locationsQuery) ? locationsQuery : (locationsQuery.rows || [])
    
    const countriesSet = new Set<string>()
    const statesSet = new Set<string>()
    const citiesSet = new Set<string>()

    for (const r of locationRows) {
      const rowData = r as { country?: string; state?: string; city?: string }
      if (rowData.country) {
        countriesSet.add(toTitleCase(rowData.country.trim()))
      }
      if (rowData.state) {
        statesSet.add(toTitleCase(rowData.state.trim()))
      }
      if (rowData.city) {
        citiesSet.add(toTitleCase(rowData.city.trim()))
      }
    }

    countryOptions = Array.from(countriesSet).sort().map((c) => ({
      label: c,
      value: c,
    }))

    stateOptions = Array.from(statesSet).sort().map((s) => ({
      label: s,
      value: s,
    }))

    cityOptions = Array.from(citiesSet).sort().map((c) => ({
      label: c,
      value: c,
    }))

    const page = typeof resolvedParams.page === 'string' ? Math.max(1, parseInt(resolvedParams.page) || 1) : 1
    const reqPage = typeof resolvedParams.reqPage === 'string' ? Math.max(1, parseInt(resolvedParams.reqPage) || 1) : 1
    const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : 'newest'

    const [propertiesResult, requestsResult] = await Promise.all([
      SellerDashboardRepository.getSellerProperties(
        user.id,
        {
          type,
          country,
          state,
          city,
          status,
          location,
          lat,
          lng,
          radius,
        },
        page,
        sort
      ),
      SellerDashboardRepository.getSellerRequests(user.id, reqPage),
    ])

    let redirectRequired = false
    const redirectParams = new URLSearchParams()

    Object.entries(resolvedParams).forEach(([key, val]) => {
      if (val !== undefined) {
        redirectParams.set(key, Array.isArray(val) ? val.join(',') : val.toString())
      }
    })

    if (propertiesResult.shouldRedirect && propertiesResult.redirectToPage) {
      redirectParams.set('page', propertiesResult.redirectToPage.toString())
      redirectRequired = true
    }

    if (requestsResult.shouldRedirect && requestsResult.redirectToPage) {
      redirectParams.set('reqPage', requestsResult.redirectToPage.toString())
      redirectRequired = true
    }

    if (redirectRequired) {
      redirect(`/dashboard/seller?${redirectParams.toString()}`)
    }

    properties = propertiesResult.docs
    resultPagination = {
      page: propertiesResult.page,
      totalPages: propertiesResult.totalPages,
      totalDocs: propertiesResult.totalDocs,
    }

    sellerRequests = requestsResult.docs
    requestsPagination = {
      page: requestsResult.page,
      totalPages: requestsResult.totalPages,
      totalDocs: requestsResult.totalDocs,
    }
  } catch (error) {
    console.error('Error fetching seller properties:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm-soft mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-gold-royal/10 text-gold-royal text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-gold-royal/20">
                  Seller Portal
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-navy-deep tracking-tight">
                Seller Dashboard
              </h1>
              <p className="mt-1.5 text-sm text-gray-500 font-medium">
                Welcome back, <span className="text-navy-deep font-bold">{user.full_name}</span> (
                {user.company_name || 'Independent Owner'})
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild className="bg-navy-deep hover:bg-navy-deep/90 text-white shadow-lg-soft">
                <Link href="/sell">Submit New Asset</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Card 1: Total Portfolio (Darkest Brand Blue) */}
          <Card className="border-none shadow-2xl-soft hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group bg-gradient-to-br from-[#040D21] to-[#0A1A3F] border border-white/5 hover:border-gold-royal/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
              <CardTitle className="text-xs font-bold text-white/75">
                Portfolio Assets
              </CardTitle>
              <div className="p-2.5 bg-white/5 text-gold-royal rounded-xl border border-white/10 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold-royal to-gold-dark mb-1">{stats.totalProperties}</div>
              <p className="text-xs text-white/50 font-medium">Total registered listings</p>
            </CardContent>
          </Card>

          {/* Card 2: Accumulated Views (Medium Dark Brand Blue) */}
          <Card className="border-none shadow-2xl-soft hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group bg-gradient-to-br from-[#061433] to-[#0E2559] border border-white/5 hover:border-gold-royal/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
              <CardTitle className="text-xs font-bold text-white/75">
                Live Portfolio Views
              </CardTitle>
              <div className="p-2.5 bg-white/5 text-gold-royal rounded-xl border border-white/10 group-hover:scale-110 transition-transform duration-300">
                <Eye className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold-royal to-gold-dark mb-1">{stats.totalViews}</div>
              <p className="text-xs text-white/50 font-medium">Accumulated visits tracker</p>
            </CardContent>
          </Card>

          {/* Card 3: Listing Status (Medium Brand Blue) */}
          <Card className="border-none shadow-2xl-soft hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group bg-gradient-to-br from-[#091D4A] to-[#123173] border border-white/5 hover:border-gold-royal/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
              <CardTitle className="text-xs font-bold text-white/75">
                Listing Status
              </CardTitle>
              <div className="p-2.5 bg-white/5 text-gold-royal rounded-xl border border-white/10 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold-royal to-gold-dark mb-1">{stats.activeListings}</div>
              <p className="text-xs text-white/50 font-medium">For Sale assets on Fimac</p>
            </CardContent>
          </Card>

          {/* Card 4: Verification Status (Lighter Brand Blue) */}
          <Card className="border-none shadow-2xl-soft hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group bg-gradient-to-br from-[#0D2660] to-[#17408C] border border-white/5 hover:border-gold-royal/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
              <CardTitle className="text-xs font-bold text-white/75">
                Partner Status
              </CardTitle>
              <div className="p-2.5 bg-white/5 text-gold-royal rounded-xl border border-white/10 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="text-2xl font-extrabold text-white mb-1">
                {user.verification_status === 'verified' ? 'Verified Partner' : 'Pending'}
              </div>
              <p className="text-xs text-white/50 font-medium">
                {user.verification_status === 'verified'
                  ? '✅ Access fully activated'
                  : '⏳ Verification pending review'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Listing Requests Status Tracker */}
        <SellerRequestsClient
          initialRequests={sellerRequests}
          currentPage={requestsPagination.page}
          totalPages={requestsPagination.totalPages}
          totalCount={requestsPagination.totalDocs}
        />

        {/* Portfolio Live Manager */}
        <SellerPortfolioClient
          initialProperties={properties}
          propertyTypeOptions={propertyTypeOptions}
          listingStatusOptions={listingStatusOptions}
          cityOptions={cityOptions}
          stateOptions={stateOptions}
          countryOptions={countryOptions}
          currentPage={resultPagination.page}
          totalPages={resultPagination.totalPages}
          totalCount={resultPagination.totalDocs}
        />
      </div>
    </div>
  )
}
