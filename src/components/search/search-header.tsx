'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, SlidersHorizontal, Globe, MapPin, Building2, DollarSign } from 'lucide-react'
import { useState, useTransition, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface SearchHeaderProps {
  propertyTypeOptions?: Array<{ label: string; value: string }>
  listingStatusOptions?: Array<{ label: string; value: string }>
  cityOptions?: Array<{ label: string; value: string }>
  countryOptions?: Array<{ label: string; value: string }>
}

export function SearchHeader({
  propertyTypeOptions = [],
  listingStatusOptions = [],
  cityOptions = [],
  countryOptions = [],
}: SearchHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  // Initialize local state from URL so it survives reloads
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [country, setCountry] = useState(searchParams.get('country') || 'all')
  const [city, setCity] = useState(searchParams.get('city') || 'all')
  const [propertyType, setPropertyType] = useState(searchParams.get('type') || 'all')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [quickPrice, setQuickPrice] = useState(searchParams.get('quickPrice') || 'all')
  const [listingStatus, setListingStatus] = useState(searchParams.get('listingStatus') || 'all')
  const [constructionStatus, setConstructionStatus] = useState(searchParams.get('constructionStatus') || 'all')

  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const lastPushedLocation = useRef(searchParams.get('location') || '')

  const getSearchSummary = () => {
    const parts: string[] = []

    if (location) {
      parts.push(location)
    }

    if (country && country !== 'all') {
      parts.push(country)
    }

    if (city && city !== 'all') {
      parts.push(city)
    }

    if (propertyType && propertyType !== 'all') {
      const selectedOpt = propertyTypeOptions.find((o) => o.value === propertyType)
      parts.push(selectedOpt ? selectedOpt.label : propertyType)
    }

    if (category && category !== 'all') {
      parts.push(category)
    }

    if (listingStatus && listingStatus !== 'all') {
      const matchedOpt = listingStatusOptions.find((o) => o.value === listingStatus)
      parts.push(matchedOpt ? matchedOpt.label : listingStatus)
    }

    if (constructionStatus && constructionStatus !== 'all') {
      const constructionLabels: Record<string, string> = {
        ready: 'Ready to Move In',
        under_construction: 'Under Construction',
        brand_new: 'Brand New',
        off_plan: 'Off-Plan',
        renovated: 'Fully Renovated',
      }
      parts.push(constructionLabels[constructionStatus] || constructionStatus)
    }

    if (quickPrice && quickPrice !== 'all') {
      const priceLabels: Record<string, string> = {
        '0-1m': 'Under $1M',
        '1m-3m': '$1M - $3M',
        '3m-5m': '$3M - $5M',
        '5m-10m': '$5M - $10M',
        '10m+': '$10M+',
      }
      parts.push(priceLabels[quickPrice] || quickPrice)
    }

    return parts.length > 0 ? `📍 ${parts.join(' • ')}` : '🔍 Where are you investing?'
  }

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

      // If a text location is set, clear geographic coordinates
      if (newParams.hasOwnProperty('location')) {
        const val = newParams.location?.toString() || ''
        lastPushedLocation.current = val
        if (val) {
          params.delete('lat')
          params.delete('lng')
          params.delete('radius')
        }
      }

      // Always reset to page 1 on filter changes
      params.delete('page')

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [searchParams, pathname, router, startTransition],
  )

  const triggerSearch = useCallback(() => {
    updateFilters({ location })
  }, [location, updateFilters])

  // Debounced update for text inputs/sliders (increased to 800ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (location !== (searchParams.get('location') || '')) {
        updateFilters({ location })
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [location, searchParams, updateFilters])

  const handleReset = () => {
    setLocation('')
    setCountry('all')
    setCity('all')
    setPropertyType('all')
    setCategory('all')
    setQuickPrice('all')
    setListingStatus('all')
    setConstructionStatus('all')
    lastPushedLocation.current = ''

    const params = new URLSearchParams()
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Effect to sync URL back to local state (only when NOT focused)
  useEffect(() => {
    if (!isFocused) {
      const urlLoc = searchParams.get('location') || ''
      if (urlLoc !== lastPushedLocation.current) {
        setLocation(urlLoc)
        lastPushedLocation.current = urlLoc
      }
    }
    setCountry(searchParams.get('country') || 'all')
    setCity(searchParams.get('city') || 'all')
    setPropertyType(searchParams.get('type') || 'all')
    setCategory(searchParams.get('category') || 'all')
    setQuickPrice(searchParams.get('quickPrice') || 'all')
    setListingStatus(searchParams.get('listingStatus') || 'all')
    setConstructionStatus(searchParams.get('constructionStatus') || 'all')
  }, [searchParams, isFocused])

  return (
    <>
      {/* Mobile/Tablet View: Sticky Floating Pill Search Bar */}
      <div className="lg:hidden w-full px-2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <div className="flex items-center justify-between w-full h-14 bg-blue-fimac border border-white/10 hover:border-gold-royal/30 rounded-full px-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] cursor-pointer transition-all duration-300">
              <div className="flex items-center gap-3 overflow-hidden pr-4">
                <Search className="h-5 w-5 text-gold-royal shrink-0" />
                <span className="text-xs font-bold text-white/90 truncate tracking-wide">
                  {getSearchSummary()}
                </span>
              </div>
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gold-royal/10 border border-gold-royal/30 text-gold-royal shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
            </div>
          </SheetTrigger>
          <SheetContent side="bottom-smooth" className="rounded-t-[32px] border-t border-white/10 bg-[#061849] p-6 text-white h-[580px] max-h-[90vh] overflow-y-auto z-[9999]">
            <div className="space-y-6">
              <SheetHeader className="text-left pb-2 border-b border-white/10 mb-2">
                <SheetTitle className="text-base font-bold text-gold-royal">
                  Refine Search
                </SheetTitle>
              </SheetHeader>

              {/* Keyword & Location */}
              <div className="space-y-2">
                <Label htmlFor="mobile-location" className="text-xs font-bold text-white/80">
                  Keyword & Location
                </Label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    id="mobile-location"
                    placeholder="Search by title, location or keyword..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateFilters({ location })
                        setIsOpen(false)
                      }
                    }}
                    className="pl-12 h-14 bg-[#05133a]/60 border border-blue-900/80 text-white placeholder:text-white/40 rounded-2xl w-full focus:border-gold-royal"
                  />
                </div>
              </div>

              {/* Country Selection */}
              <div className="space-y-2">
                <Label htmlFor="mobile-country" className="text-xs font-bold text-white/80">
                  Country
                </Label>
                <Select
                  value={country}
                  onValueChange={(val) => {
                    setCountry(val)
                    updateFilters({ country: val })
                  }}
                >
                  <SelectTrigger id="mobile-country" className="w-full h-14 bg-[#05133a]/60 border border-blue-900/80 text-white rounded-2xl">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent className="select-smooth-content rounded-xl border-white/10 bg-[#09153d] text-white z-[10000]">
                    <SelectItem value="all">All Countries</SelectItem>
                    {countryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-white hover:text-gold-royal">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              {/* City Selection */}
              <div className="space-y-2">
                <Label htmlFor="mobile-city" className="text-xs font-bold text-white/80">
                  City
                </Label>
                <Select
                  value={city}
                  onValueChange={(val) => {
                    setCity(val)
                    updateFilters({ city: val })
                  }}
                >
                  <SelectTrigger id="mobile-city" className="w-full h-14 bg-[#05133a]/60 border border-blue-900/80 text-white rounded-2xl">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent className="select-smooth-content rounded-xl border-white/10 bg-[#09153d] text-white z-[10000]">
                    <SelectItem value="all">All Cities</SelectItem>
                    {cityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-white hover:text-gold-royal">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <Label htmlFor="mobile-property-type" className="text-xs font-bold text-white/80">
                  Property Type
                </Label>
                <Select
                  value={propertyType}
                  onValueChange={(val) => {
                    setPropertyType(val)
                    updateFilters({ type: val })
                  }}
                >
                  <SelectTrigger id="mobile-property-type" className="w-full h-14 bg-[#05133a]/60 border border-blue-900/80 text-white rounded-2xl">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="select-smooth-content rounded-xl border-white/10 bg-[#09153d] text-white z-[10000]">
                    <SelectItem value="all">All Exclusive Types</SelectItem>
                    {propertyTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-white hover:text-gold-royal">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <Label htmlFor="mobile-price-range" className="text-xs font-bold text-white/80">
                  Budget
                </Label>
                <Select
                  value={quickPrice}
                  onValueChange={(val) => {
                    setQuickPrice(val)
                    updateFilters({ quickPrice: val })
                  }}
                >
                  <SelectTrigger id="mobile-price-range" className="w-full h-14 bg-white/[0.07] border border-white/10 text-white rounded-2xl">
                    <SelectValue placeholder="Select Range" />
                  </SelectTrigger>
                  <SelectContent className="select-smooth-content rounded-xl border-white/10 bg-[#09153d] text-white z-[10000]">
                    <SelectItem value="all">Unlimited Budget</SelectItem>
                    <SelectItem value="0-1m">Under $1M</SelectItem>
                    <SelectItem value="1m-3m">$1M - $3M</SelectItem>
                    <SelectItem value="3m-5m">$3M - $5M</SelectItem>
                    <SelectItem value="5m-10m">$5M - $10M</SelectItem>
                    <SelectItem value="10m+">$10M+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Listing Status */}
              <div className="space-y-2">
                <Label htmlFor="mobile-listing-status" className="text-xs font-bold text-white/80">
                  Listing Status
                </Label>
                <Select
                  value={listingStatus}
                  onValueChange={(val) => {
                    setListingStatus(val)
                    updateFilters({ listingStatus: val })
                  }}
                >
                  <SelectTrigger id="mobile-listing-status" className="w-full h-14 bg-[#05133a]/60 border border-blue-900/80 text-white rounded-2xl">
                    <SelectValue placeholder="Select Listing Status" />
                  </SelectTrigger>
                  <SelectContent className="select-smooth-content rounded-xl border-white/10 bg-[#09153d] text-white z-[10000]">
                    <SelectItem value="all">All Active Statuses</SelectItem>
                    {listingStatusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Construction Status */}
              <div className="space-y-2">
                <Label htmlFor="mobile-construction-status" className="text-xs font-bold text-white/80">
                  Construction Status
                </Label>
                <Select
                  value={constructionStatus}
                  onValueChange={(val) => {
                    setConstructionStatus(val)
                    updateFilters({ constructionStatus: val })
                  }}
                >
                  <SelectTrigger id="mobile-construction-status" className="w-full h-14 bg-[#05133a]/60 border border-blue-900/80 text-white rounded-2xl">
                    <SelectValue placeholder="Select Construction Status" />
                  </SelectTrigger>
                  <SelectContent className="select-smooth-content rounded-xl border-white/10 bg-[#09153d] text-white z-[10000]">
                    <SelectItem value="all">All Construction States</SelectItem>
                    <SelectItem value="ready">Ready to Move In</SelectItem>
                    <SelectItem value="under_construction">Under Construction</SelectItem>
                    <SelectItem value="brand_new">Brand New</SelectItem>
                    <SelectItem value="off_plan">Off-Plan</SelectItem>
                    <SelectItem value="renovated">Fully Renovated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => {
                    handleReset()
                    setIsOpen(false)
                  }}
                  variant="outline"
                  className="flex-1 h-14 border border-white/10 bg-white/5 text-white rounded-2xl"
                >
                  Reset
                </Button>
                <Button
                  onClick={() => {
                    updateFilters({ location })
                    setIsOpen(false)
                  }}
                  className="flex-1 h-14 bg-gold-royal hover:bg-gold-royal/90 text-white font-bold uppercase tracking-widest rounded-2xl border border-gold-royal"
                >
                  Explore
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop View: Full Form */}
      <div className="hidden lg:block bg-blue-fimac backdrop-blur-3xl border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] rounded-[32px] p-6 lg:p-8 transition-all duration-500 hover:border-gold-royal/30">
        <div className="flex flex-col gap-6">
          {/* Row 1: Search Input & Explore Button */}
          <div className="grid grid-cols-12 gap-5 items-end">
            <div className="col-span-9 xl:col-span-10">
              <Label
                htmlFor="location"
                className="mb-2 block text-xs font-bold text-white/80"
              >
                Keyword & Location
              </Label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40 transition-colors group-focus-within:text-gold-royal" />
                <Input
                  id="location"
                  placeholder="Search by title, country, city, or keyword..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      triggerSearch()
                    }
                  }}
                  className="pl-12 h-14 bg-[#05133a]/60 border border-blue-900/80 text-white placeholder:text-white/40 hover:border-blue-700/60 focus:border-gold-royal focus:ring-1 focus:ring-gold-royal/50 rounded-2xl transition-all"
                />
              </div>
            </div>

            <div className="col-span-3 xl:col-span-2">
              <Button 
                onClick={triggerSearch}
                className="w-full h-14 bg-gold-royal hover:bg-gold-royal/90 text-white font-bold uppercase tracking-widest rounded-2xl shadow-gold transition-all duration-500 hover:shadow-[0_0_25px_rgba(191,155,88,0.35)] active:scale-95 border border-gold-royal/50 hover:border-gold-royal"
              >
                <Search className="mr-2 h-5 w-5" />
                Explore
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-white/10 w-full" />

          {/* Row 2: Filters Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Country Selection */}
            <div>
              <Label
                htmlFor="country"
                className="mb-2 block text-xs font-bold text-white/80"
              >
                Country
              </Label>
              <Select
                value={country}
                onValueChange={(val) => {
                  setCountry(val)
                  updateFilters({ country: val })
                }}
              >
                <SelectTrigger
                  id="country"
                  className="w-full h-12 bg-[#05133a]/60 border border-blue-900/80 text-white hover:border-blue-700/60 hover:bg-[#05133a]/80 focus:border-gold-royal focus:ring-1 focus:ring-gold-royal/50 rounded-xl transition-all flex items-center gap-2 px-3"
                >
                  <Globe className="h-4 w-4 text-gold-royal/80 shrink-0" />
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gold-royal/20">
                  <SelectItem value="all">All Countries</SelectItem>
                  {countryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            {/* City Selection */}
            <div>
              <Label
                htmlFor="city"
                className="mb-2 block text-xs font-bold text-white/80"
              >
                City
              </Label>
              <Select
                value={city}
                onValueChange={(val) => {
                  setCity(val)
                  updateFilters({ city: val })
                }}
              >
                <SelectTrigger
                  id="city"
                  className="w-full h-12 bg-[#05133a]/60 border border-blue-900/80 text-white hover:border-blue-700/60 hover:bg-[#05133a]/80 focus:border-gold-royal focus:ring-1 focus:ring-gold-royal/50 rounded-xl transition-all flex items-center gap-2 px-3"
                >
                  <MapPin className="h-4 w-4 text-gold-royal/80 shrink-0" />
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gold-royal/20">
                  <SelectItem value="all">All Cities</SelectItem>
                  {cityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Property Type */}
            <div>
              <Label
                htmlFor="property-type"
                className="mb-2 block text-xs font-bold text-white/80"
              >
                Property Type
              </Label>
              <Select
                value={propertyType}
                onValueChange={(val) => {
                  setPropertyType(val)
                  updateFilters({ type: val })
                }}
              >
                <SelectTrigger
                  id="property-type"
                  className="w-full h-12 bg-[#05133a]/60 border border-blue-900/80 text-white hover:border-blue-700/60 hover:bg-[#05133a]/80 focus:border-gold-royal focus:ring-1 focus:ring-gold-royal/50 rounded-xl transition-all flex items-center gap-2 px-3"
                >
                  <Building2 className="h-4 w-4 text-gold-royal/80 shrink-0" />
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gold-royal/20">
                  <SelectItem value="all">All Exclusive Types</SelectItem>
                  {propertyTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range (Quick) */}
            <div>
              <Label
                htmlFor="price-range"
                className="mb-2 block text-xs font-bold text-white/80"
              >
                Budget
              </Label>
              <Select
                value={quickPrice}
                onValueChange={(val) => {
                  setQuickPrice(val)
                  updateFilters({ quickPrice: val })
                }}
              >
                <SelectTrigger
                  id="price-range"
                  className="w-full h-12 bg-[#05133a]/60 border border-blue-900/80 text-white hover:border-blue-700/60 hover:bg-[#05133a]/80 focus:border-gold-royal focus:ring-1 focus:ring-gold-royal/50 rounded-xl transition-all flex items-center gap-2 px-3"
                >
                  <DollarSign className="h-4 w-4 text-gold-royal/80 shrink-0" />
                  <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gold-royal/20">
                  <SelectItem value="all">Unlimited Budget</SelectItem>
                  <SelectItem value="0-1m">Under $1M</SelectItem>
                  <SelectItem value="1m-3m">$1M - $3M</SelectItem>
                  <SelectItem value="3m-5m">$3M - $5M</SelectItem>
                  <SelectItem value="5m-10m">$5M - $10M</SelectItem>
                  <SelectItem value="10m+">$10M+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Listing Status */}
            <div>
              <Label
                htmlFor="listing-status"
                className="mb-2 block text-xs font-bold text-white/80"
              >
                Listing Status
              </Label>
              <Select
                value={listingStatus}
                onValueChange={(val) => {
                  setListingStatus(val)
                  updateFilters({ listingStatus: val })
                }}
              >
                <SelectTrigger
                  id="listing-status"
                  className="w-full h-12 bg-[#05133a]/60 border border-blue-900/80 text-white hover:border-blue-700/60 hover:bg-[#05133a]/80 focus:border-gold-royal focus:ring-1 focus:ring-gold-royal/50 rounded-xl transition-all flex items-center gap-2 px-3"
                >
                  <Building2 className="h-4 w-4 text-gold-royal/80 shrink-0" />
                  <SelectValue placeholder="Select Listing Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gold-royal/20">
                  <SelectItem value="all">All Active Statuses</SelectItem>
                  {listingStatusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Construction Status */}
            <div>
              <Label
                htmlFor="construction-status"
                className="mb-2 block text-xs font-bold text-white/80"
              >
                Construction State
              </Label>
              <Select
                value={constructionStatus}
                onValueChange={(val) => {
                  setConstructionStatus(val)
                  updateFilters({ constructionStatus: val })
                }}
              >
                <SelectTrigger
                  id="construction-status"
                  className="w-full h-12 bg-[#05133a]/60 border border-blue-900/80 text-white hover:border-blue-700/60 hover:bg-[#05133a]/80 focus:border-gold-royal focus:ring-1 focus:ring-gold-royal/50 rounded-xl transition-all flex items-center gap-2 px-3"
                >
                  <SlidersHorizontal className="h-4 w-4 text-gold-royal/80 shrink-0" />
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gold-royal/20">
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="ready">Ready to Move In</SelectItem>
                  <SelectItem value="under_construction">Under Construction</SelectItem>
                  <SelectItem value="brand_new">Brand New</SelectItem>
                  <SelectItem value="off_plan">Off-Plan</SelectItem>
                  <SelectItem value="renovated">Fully Renovated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(location || country !== 'all' || city !== 'all' || propertyType !== 'all' || category !== 'all' || searchParams.get('lat')) && (
        <div className="mt-4 lg:mt-6 w-full flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500 bg-[#061849]/90 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-full px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <span className="text-xs font-bold text-gold-royal shrink-0 mr-1">
            Curating:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {searchParams.get('lat') && (
              <div className="flex items-center bg-gold-royal text-white px-3.5 py-1.5 rounded-full border border-gold-royal/30 shadow-gold text-xs font-bold transition-all hover:bg-navy-deep cursor-default">
                <span className="mr-1.5 opacity-70">◈</span>
                Spatial Discovery: {parseFloat(searchParams.get('lat')!).toFixed(2)}N,{' '}
                {parseFloat(searchParams.get('lng')!).toFixed(2)}E
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete('lat')
                    params.delete('lng')
                    params.delete('radius')
                    router.push(`${pathname}?${params.toString()}`, { scroll: false })
                  }}
                  className="ml-2 hover:text-white/60 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {location && (
              <div className="flex items-center bg-white/10 text-white px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-bold transition-all hover:bg-gold-royal hover:border-gold-royal/30 cursor-default">
                <span className="mr-1.5 text-gold-royal">#</span>
                {location}
                <button
                  onClick={() => setLocation('')}
                  className="ml-2 hover:text-gold-royal transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {country !== 'all' && (
              <div className="flex items-center bg-[#bf9b58] text-white px-3.5 py-1.5 rounded-full border border-gold-royal/30 text-xs font-bold transition-all hover:bg-navy-deep cursor-default shadow-gold animate-in fade-in zoom-in duration-300">
                <span className="mr-1.5 text-white opacity-70">🏳️</span>
                {country}
                <button
                  onClick={() => {
                    setCountry('all')
                    updateFilters({ country: 'all' })
                  }}
                  className="ml-2 hover:text-white/60 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}


            {city !== 'all' && (
              <div className="flex items-center bg-[#bf9b58] text-white px-3.5 py-1.5 rounded-full border border-gold-royal/30 text-xs font-bold transition-all hover:bg-navy-deep cursor-default shadow-gold">
                <span className="mr-1.5 text-white opacity-70">📍</span>
                {city}
                <button
                  onClick={() => {
                    setCity('all')
                    updateFilters({ city: 'all' })
                  }}
                  className="ml-2 hover:text-white/60 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {propertyType !== 'all' && (
              <div className="flex items-center bg-white/10 text-white px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-bold transition-all hover:bg-gold-royal hover:border-gold-royal/30 cursor-default">
                <span className="mr-1.5 text-gold-royal">@</span>
                {propertyType}
                <button
                  onClick={() => {
                    setPropertyType('all')
                    updateFilters({ type: 'all' })
                  }}
                  className="ml-2 hover:text-gold-royal transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {category !== 'all' && (
              <div className="flex items-center bg-white/10 text-white px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-bold transition-all hover:bg-gold-royal hover:border-gold-royal/30 cursor-default">
                <span className="mr-1.5 text-gold-royal">@</span>
                {category}
                <button
                  onClick={() => {
                    setCategory('all')
                    updateFilters({ category: 'all' })
                  }}
                  className="ml-2 hover:text-gold-royal transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
