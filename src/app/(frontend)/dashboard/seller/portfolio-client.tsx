'use client'

import { useState, useEffect, useCallback, useTransition, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, Eye, Search, MapPin, Globe, Map, DollarSign, Activity } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { buildPropertyUrl } from '@/repository/property/generate-url'
import { formatPrice } from '@/lib/format-price'

export interface SiblingProperty {
  id: string
  title: string
  price?: number | null
  currency?: string | null
  listingStatus: string
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
    sizes?: {
      card?: {
        url?: string | null
      } | null
    } | null
  }> | null
}

interface SellerPortfolioClientProps {
  initialProperties: SiblingProperty[]
  propertyTypeOptions?: Array<{ label: string; value: string }>
  cityOptions?: Array<{ label: string; value: string }>
  stateOptions?: Array<{ label: string; value: string }>
  countryOptions?: Array<{ label: string; value: string }>
}

export function SellerPortfolioClient({
  initialProperties = [],
  propertyTypeOptions = [],
  cityOptions = [],
  stateOptions = [],
  countryOptions = [],
}: SellerPortfolioClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  // Sync state variables with URL
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [isFocused, setIsFocused] = useState(false)
  const [countryFilter, setCountryFilter] = useState(searchParams.get('country') || 'all')
  const [stateFilter, setStateFilter] = useState(searchParams.get('state') || 'all')
  const [cityFilter, setCityFilter] = useState(searchParams.get('city') || 'all')
  const [propertyType, setPropertyType] = useState(searchParams.get('type') || 'all')
  const [quickPrice, setQuickPrice] = useState(searchParams.get('quickPrice') || 'all')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')

  const lastPushedLocation = useRef(searchParams.get('location') || '')

  const updateFilters = useCallback(
    (newParams: Partial<Record<string, string | number>>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(newParams).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== 'any') {
          params.set(key, value.toString())
        } else {
          params.delete(key)
        }
      })

      // If text query changes, remove geographic lat/lng filter to avoid confusion
      if (newParams.hasOwnProperty('location')) {
        const val = newParams.location?.toString() || ''
        lastPushedLocation.current = val
        if (val) {
          params.delete('lat')
          params.delete('lng')
          params.delete('radius')
        }
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [searchParams, pathname, router]
  )

  // Debounced search text update (increased to 800ms for smoother typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (location !== (searchParams.get('location') || '')) {
        updateFilters({ location })
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [location, searchParams, updateFilters])

  // Sync URL values back to state on backward/forward navigation (only when input is NOT focused)
  useEffect(() => {
    if (!isFocused) {
      const urlLoc = searchParams.get('location') || ''
      if (urlLoc !== lastPushedLocation.current) {
        setLocation(urlLoc)
        lastPushedLocation.current = urlLoc
      }
    }
    setCountryFilter(searchParams.get('country') || 'all')
    setStateFilter(searchParams.get('state') || 'all')
    setCityFilter(searchParams.get('city') || 'all')
    setPropertyType(searchParams.get('type') || 'all')
    setQuickPrice(searchParams.get('quickPrice') || 'all')
    setStatusFilter(searchParams.get('status') || 'all')
  }, [searchParams, isFocused])

  const handleReset = () => {
    setLocation('')
    setCountryFilter('all')
    setStateFilter('all')
    setCityFilter('all')
    setPropertyType('all')
    setQuickPrice('all')
    setStatusFilter('all')
    lastPushedLocation.current = ''
    router.push(pathname, { scroll: false })
  }

  // Helper to format currency
  const formatCurrency = (value?: number | null, currencyCode?: string | null) => {
    if (!value) return 'Price on Request'
    return formatPrice(value, currencyCode || 'USD')
  }

  // Get status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'forsale':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700'
      case 'pending':
      case 'contract':
      case 'contingent':
        return 'bg-amber-50 border-amber-200 text-amber-700'
      case 'sold':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'offmarket':
      case 'notforsale':
        return 'bg-gray-50 border-gray-200 text-gray-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  // Get status display label
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      forsale: 'For Sale',
      pending: 'Offer Pending',
      contract: 'Under Contract',
      contingent: 'Contingent',
      sold: 'Sold',
      offmarket: 'Off Market',
      notforsale: 'Not For Sale',
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-6">
      {/* Real-time Search & Filter Capsule */}
      <div className="bg-blue-fimac p-6 rounded-[32px] shadow-2xl-soft border border-white/10 hover:border-gold-royal/30 transition-all duration-300">
        <div className="flex flex-col gap-5">
          {/* Row 1: Location / Search Query */}
          <div className="w-full">
            <Label className="mb-2 block text-xs font-bold text-white/80">
              Keyword Search
            </Label>
            <div className="relative group">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-white/40 transition-colors group-focus-within:text-gold-royal" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Search location or title keywords..."
                className="pl-12 pr-4 h-12 rounded-2xl border-blue-900/80 bg-[#05133a]/60 text-white placeholder:text-white/40 focus:border-gold-royal focus:ring-gold-royal/50 hover:border-blue-700/60 transition-all duration-300"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-white/10 w-full" />

          {/* Row 2: 6 Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Country Dropdown */}
            <div>
              <Label className="mb-2 block text-xs font-bold text-white/80">
                Country
              </Label>
              <Select
                value={countryFilter}
                onValueChange={(val) => {
                  setCountryFilter(val)
                  updateFilters({ country: val })
                }}
              >
                <SelectTrigger className="h-12 rounded-2xl border-blue-900/80 bg-[#05133a]/60 text-white hover:border-blue-700/60 hover:bg-[#05133a]/80 font-semibold flex items-center gap-2 px-3 focus:border-gold-royal transition-all duration-300">
                  <Globe className="h-4 w-4 text-gold-royal/80 shrink-0" />
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gold-royal/20">
                  <SelectItem value="all" className="rounded-lg">All Countries</SelectItem>
                  {countryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* State Dropdown */}
            <div>
              <Label className="mb-2 block text-xs font-bold text-white/80">
                State
              </Label>
              <Select
                value={stateFilter}
                onValueChange={(val) => {
                  setStateFilter(val)
                  updateFilters({ state: val })
                }}
              >
                <SelectTrigger className="h-12 rounded-2xl border-blue-900/80 bg-[#05133a]/60 text-white hover:border-blue-700/60 hover:bg-[#05133a]/80 font-semibold flex items-center gap-2 px-3 focus:border-gold-royal transition-all duration-300">
                  <Map className="h-4 w-4 text-gold-royal/80 shrink-0" />
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gold-royal/20">
                  <SelectItem value="all" className="rounded-lg">All States</SelectItem>
                  {stateOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City Dropdown */}
            <div>
              <Label className="mb-2 block text-xs font-bold text-white/80">
                City
              </Label>
              <Select
                value={cityFilter}
                onValueChange={(val) => {
                  setCityFilter(val)
                  updateFilters({ city: val })
                }}
              >
                <SelectTrigger className="h-12 rounded-2xl border-blue-900/80 bg-[#05133a]/60 text-white hover:border-blue-700/60 hover:bg-[#05133a]/80 font-semibold flex items-center gap-2 px-3 focus:border-gold-royal transition-all duration-300">
                  <MapPin className="h-4 w-4 text-gold-royal/80 shrink-0" />
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gold-royal/20">
                  <SelectItem value="all" className="rounded-lg">All Cities</SelectItem>
                  {cityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Property Type Dropdown */}
            <div>
              <Label className="mb-2 block text-xs font-bold text-white/80">
                Property Type
              </Label>
              <Select
                value={propertyType}
                onValueChange={(val) => {
                  setPropertyType(val)
                  updateFilters({ type: val })
                }}
              >
                <SelectTrigger className="h-12 rounded-2xl border-blue-900/80 bg-[#05133a]/60 text-white hover:border-blue-700/60 hover:bg-[#05133a]/80 font-semibold flex items-center gap-2 px-3 focus:border-gold-royal transition-all duration-300">
                  <Building2 className="h-4 w-4 text-gold-royal/80 shrink-0" />
                  <SelectValue placeholder="All Property Types" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gold-royal/20">
                  <SelectItem value="all" className="rounded-lg">All Property Types</SelectItem>
                  {propertyTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget Dropdown */}
            <div>
              <Label className="mb-2 block text-xs font-bold text-white/80">
                Budget
              </Label>
              <Select
                value={quickPrice}
                onValueChange={(val) => {
                  setQuickPrice(val)
                  updateFilters({ quickPrice: val })
                }}
              >
                <SelectTrigger className="h-12 rounded-2xl border-blue-900/80 bg-[#05133a]/60 text-white hover:border-blue-700/60 hover:bg-[#05133a]/80 font-semibold flex items-center gap-2 px-3 focus:border-gold-royal transition-all duration-300">
                  <DollarSign className="h-4 w-4 text-gold-royal/80 shrink-0" />
                  <SelectValue placeholder="All Budgets" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gold-royal/20">
                  <SelectItem value="all" className="rounded-lg">All Budgets</SelectItem>
                  <SelectItem value="0-1m" className="rounded-lg">Under $1M</SelectItem>
                  <SelectItem value="1m-3m" className="rounded-lg">$1M - $3M</SelectItem>
                  <SelectItem value="3m-5m" className="rounded-lg">$3M - $5M</SelectItem>
                  <SelectItem value="5m-10m" className="rounded-lg">$5M - $10M</SelectItem>
                  <SelectItem value="10m+" className="rounded-lg">$10M+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Dropdown */}
            <div>
              <Label className="mb-2 block text-xs font-bold text-white/80">
                Status
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val)
                  updateFilters({ status: val })
                }}
              >
                <SelectTrigger className="h-12 rounded-2xl border-blue-900/80 bg-[#05133a]/60 text-white hover:border-blue-700/60 hover:bg-[#05133a]/80 font-semibold flex items-center gap-2 px-3 focus:border-gold-royal transition-all duration-300">
                  <Activity className="h-4 w-4 text-gold-royal/80 shrink-0" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gold-royal/20">
                  <SelectItem value="all" className="rounded-lg">All Statuses</SelectItem>
                  <SelectItem value="forsale" className="rounded-lg">For Sale</SelectItem>
                  <SelectItem value="pending" className="rounded-lg">Offer Pending</SelectItem>
                  <SelectItem value="contract" className="rounded-lg">Under Contract</SelectItem>
                  <SelectItem value="sold" className="rounded-lg">Sold</SelectItem>
                  <SelectItem value="offmarket" className="rounded-lg">Off Market</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Reset Filters / Active count */}
        {(location || countryFilter !== 'all' || stateFilter !== 'all' || cityFilter !== 'all' || propertyType !== 'all' || quickPrice !== 'all' || statusFilter !== 'all') && (
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
            <span className="text-white/60 font-medium">
              Found <span className="font-bold text-white">{initialProperties.length}</span> matching properties
            </span>
            <button
              onClick={handleReset}
              className="text-gold-royal hover:text-white font-bold transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Grid List */}
      {initialProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialProperties.map((p) => {
            const photoUrl =
              p.photos && p.photos.length > 0
                ? p.photos[0].sizes?.card?.url || p.photos[0].url || null
                : null
            const address = p.location?.address
            const cityState = address?.city && address?.state ? `${address.city}, ${address.state}` : ''
            const countryStr = address?.country && address.country.toLowerCase() !== 'egypt' ? `, ${address.country}` : ''
            const locationString =
              cityState
                ? `${cityState}${countryStr}`
                : address?.fullAddress || 'Location Undisclosed'

            const street = address?.street || ''
            const city = address?.city || ''
            const state = address?.state || ''
            const propertyUrl = buildPropertyUrl(p.id, { street, city, state })

            return (
              <Link href={propertyUrl} key={p.id} className="block group">
                <Card
                  className="border-none shadow-2xl-soft rounded-[32px] overflow-hidden hover:shadow-gold transition-all duration-500 bg-white h-full"
                >
                  {/* Visual Header */}
                  <div className="h-56 relative overflow-hidden bg-navy-deep">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/40 gap-3">
                        <Building2 className="h-12 w-12" />
                        <span className="text-xs uppercase tracking-wider font-bold">No Photos Loaded</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`absolute top-4 left-4 text-xs font-bold border px-3 py-1.5 rounded-full capitalize tracking-wider ${getStatusBadge(
                        p.listingStatus
                      )}`}
                    >
                      {getStatusLabel(p.listingStatus)}
                    </span>

                    {/* Property Type Badge */}
                    {p.propertyType?.name && (
                      <span className="absolute bottom-4 left-4 bg-navy-deep/80 backdrop-blur-md text-white text-xs font-bold border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
                        {p.propertyType.name}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className="p-6">
                    {/* Location & Title */}
                    <div className="flex items-center gap-1 text-xs font-bold text-gold-royal uppercase tracking-widest mb-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{locationString}</span>
                    </div>

                    <h3 className="text-xl font-bold text-navy-deep leading-snug mb-3 group-hover:text-gold-royal transition-colors duration-300">
                      {p.title}
                    </h3>

                    {/* Pricing row */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Listed Price
                        </span>
                        <span className="text-lg font-extrabold text-navy-deep">
                          {formatCurrency(p.price, p.currency)}
                        </span>
                      </div>

                      {/* Analytics Pill */}
                      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-2xl">
                        <Eye className="h-4 w-4 text-gray-500" />
                        <span className="text-xs font-extrabold text-navy-deep">
                          {p.views || 0} <span className="text-[10px] text-gray-400 font-normal">views</span>
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card className="border-none shadow-2xl-soft rounded-[40px] p-12 sm:p-20 text-center bg-white">
          <CardContent className="flex flex-col items-center max-w-md mx-auto gap-4">
            <div className="w-20 h-20 bg-gray-50 border border-gray-100 text-gray-400 rounded-3xl flex items-center justify-center mb-2">
              <Building2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-navy-deep">No Listings Found</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              We couldn&apos;t find any assets matching your search term or chosen filters. Try refining your filters or contact Fimac Administration to list new properties.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

