import { requireSeller } from '@/lib/auth/get-current-user'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/db/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Building2, Eye, TrendingUp, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { SellerPortfolioClient } from './portfolio-client'
import type { SiblingProperty } from './portfolio-client'
import { local } from '@/repository'
import type { Where } from 'payload'
import { geocodeSearch } from '@/lib/location/geocode-search'
import { getCachedPropertyTypes } from '@/lib/cache/property-types'

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
  const quickPrice = typeof resolvedParams.quickPrice === 'string' ? resolvedParams.quickPrice : 'all'
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : 'all'
  const city = typeof resolvedParams.city === 'string' ? resolvedParams.city : 'all'

  let properties: SiblingProperty[] = []
  let propertyTypeOptions: Array<{ label: string; value: string }> = []
  let countryOptions: Array<{ label: string; value: string }> = []
  let stateOptions: Array<{ label: string; value: string }> = []
  let cityOptions: Array<{ label: string; value: string }> = []
  let stats = {
    totalProperties: 0,
    totalViews: 0,
    activeListings: 0,
  }

  try {
    const payload = await getPayloadClient()

    // 1. Fetch overall analytics stats (unfiltered for this seller)
    const statsResult = await payload.find({
      collection: 'properties',
      where: {
        seller: {
          equals: user.id,
        },
      },
      depth: 0,
      limit: 1000,
    })

    const totalViews = statsResult.docs.reduce((acc, p) => acc + (p.views || 0), 0)
    const activeListings = statsResult.docs.filter((p) => p.listingStatus === 'forsale').length

    stats = {
      totalProperties: statsResult.totalDocs,
      totalViews,
      activeListings,
    }

    // 2. Fetch Property Type Options
    const typesData = await getCachedPropertyTypes()
    propertyTypeOptions = typesData.map((t) => ({
      label: t.name,
      value: t.slug,
    }))

    // Extract unique active countries for this seller
    const uniqueCountries = Array.from(
      new Set(
        statsResult.docs
          .map((p) => {
            const rawCountry = p.location?.address?.country?.trim() || 'Egypt'
            return toTitleCase(rawCountry)
          })
          .filter(Boolean)
      )
    ).sort()
    countryOptions = uniqueCountries.map((c) => ({
      label: c,
      value: c,
    }))

    // Extract unique active states for this seller
    const uniqueStates = Array.from(
      new Set(
        statsResult.docs
          .map((p) => {
            const rawState = p.location?.address?.state?.trim()
            return rawState ? toTitleCase(rawState) : ''
          })
          .filter(Boolean)
      )
    ).sort()
    stateOptions = uniqueStates.map((s) => ({
      label: s,
      value: s,
    }))

    // Extract unique active cities for this seller
    const uniqueCities = Array.from(
      new Set(
        statsResult.docs
          .map((p) => {
            const rawCity = p.location?.address?.city?.trim()
            return rawCity ? toTitleCase(rawCity) : ''
          })
          .filter(Boolean)
      )
    ).sort()
    cityOptions = uniqueCities.map((c) => ({
      label: c,
      value: c,
    }))

    // 3. Construct filtered query for seller's properties
    const andConditions: Where[] = [
      {
        seller: {
          equals: user.id,
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

    // Price Filter
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

    // Status Filter
    if (status !== 'all') {
      andConditions.push({
        listingStatus: {
          equals: status,
        },
      })
    }

    // Location / Spatial Filter (Parallelized geocoding & database legacy search)
    const [locationIds, geoBox] = await Promise.all([
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
      location ? geocodeSearch(location) : Promise.resolve(null),
    ])

    if (location) {
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

    const whereClause: Where = {
      and: andConditions,
    }

    const result = await payload.find({
      collection: 'properties',
      where: whereClause,
      depth: 2,
      limit: 100,
    })

    properties = result.docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      price: doc.price,
      currency: doc.currency,
      listingStatus: doc.listingStatus,
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
      photos: doc.photos
        ? (doc.photos
            .map((p) =>
              p && typeof p === 'object'
                ? {
                    url: p.url,
                    id: p.id ? String(p.id) : undefined,
                  }
                : null,
            )
            .filter((p) => p !== null) as { url?: string | null; id?: string | null }[])
        : null,
    }))
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

        {/* Portfolio Live Manager */}
        <SellerPortfolioClient
          initialProperties={properties}
          propertyTypeOptions={propertyTypeOptions}
          cityOptions={cityOptions}
          stateOptions={stateOptions}
          countryOptions={countryOptions}
        />
      </div>
    </div>
  )
}
