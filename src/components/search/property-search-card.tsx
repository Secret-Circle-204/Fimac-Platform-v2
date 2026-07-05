import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Property } from '@/payload-types'
import { Bed, Bath, Maximize, MapPin, Globe, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { buildPropertyUrl } from '@/repository/property/generate-url'
import { ViewsBadge } from '@/components/property/views-badge'
import { isValidCoordinate } from '@/lib/geo/is-valid-coordinate'
import { constructionStatusMap, ConstructionStatusType } from '@/collections/Properties/construction-status-map'
import { formatPrice } from '@/lib/format-price'

interface PropertySearchCardProps {
  property: Property
}

export function PropertySearchCard({ property }: PropertySearchCardProps) {
  // Get primary photo (first photo from photos array)
  const photos = property.photos
  const primaryPhoto =
    photos && Array.isArray(photos) && photos.length > 0
      ? typeof photos[0] === 'object'
        ? photos[0]
        : null
      : null

  // Get location info
  const address = typeof property.location === 'object' ? property.location?.address : null
  const geo = typeof property.location === 'object' ? property.location?.geo : null

  // Resolve canonical URL using the centralized builder
  const propertyUrl =
    (property as unknown as { url?: string }).url ||
    buildPropertyUrl(property.id, address || { street: property.street })

  // State for Globe Interactivity Highlight
  const [isGlobeHovered, setIsGlobeHovered] = useState(false)

  // Listen for the Globe hovering over this specific property
  useEffect(() => {
    const handleGlobeHover = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>
      setIsGlobeHovered(customEvent.detail === property.id)
    }
    window.addEventListener('globe-property-hover', handleGlobeHover)
    return () => window.removeEventListener('globe-property-hover', handleGlobeHover)
  }, [property.id])

  // Prefetch property detail route on hover for near-instant navigation
  const router = useRouter()
  const prefetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (prefetchTimer.current) {
        clearTimeout(prefetchTimer.current)
      }
    }
  }, [])

  // Dispatch events to the Globe when interacting with this Card
  const handleCardMouseEnter = useCallback(() => {
    if (geo && isValidCoordinate(geo.lat, geo.lng)) {
      window.dispatchEvent(
        new CustomEvent('card-property-hover', {
          detail: { id: property.id, lat: geo.lat, lng: geo.lng },
        }),
      )
    }

    // Debounced prefetch: only trigger after 300ms hover to avoid
    // spamming prefetch requests when quickly scanning the list
    prefetchTimer.current = setTimeout(() => {
      router.prefetch(propertyUrl)
    }, 300)
  }, [geo, property.id, propertyUrl, router])

  const handleCardMouseLeave = useCallback(() => {
    window.dispatchEvent(new CustomEvent('card-property-hover', { detail: null }))
    if (prefetchTimer.current) {
      clearTimeout(prefetchTimer.current)
      prefetchTimer.current = null
    }
  }, [])

  const handleCardClick = () => {
    if (geo && isValidCoordinate(geo.lat, geo.lng)) {
      window.dispatchEvent(
        new CustomEvent('card-property-click', {
          detail: { id: property.id, lat: geo.lat, lng: geo.lng },
        }),
      )
    } else {
      // Invalid coords → navigate directly to the property page instead of freezing the globe
      window.location.href = propertyUrl
    }
  }

  const constructionStatus = (property.constructionStatus || 'ready') as ConstructionStatusType
  const constructionInfo = constructionStatusMap[constructionStatus]

  return (
    <Card
      id={`property-card-${property.id}`}
      className={`overflow-hidden rounded-2xl py-0 gap-0 border border-gold-royal/30 bg-white shadow-sm transition-all duration-500 ease-out group/card cursor-pointer h-full flex flex-col hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(10,25,47,0.08)] ${
        isGlobeHovered
          ? 'ring-2 ring-gold-royal shadow-gold scale-[1.02] z-30'
          : 'hover:border-gold-royal/60'
      }`}
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
      onClick={handleCardClick}
    >
      {/* Image Section - Enlarged & Luxury Proportioned */}
      <div className="relative h-60 bg-navy-deep/5 overflow-hidden">
        {primaryPhoto?.url ? (
          <Image
            src={primaryPhoto.sizes?.card?.url || primaryPhoto.url}
            alt={primaryPhoto.alt || property.title || 'Property'}
            fill
            sizes="(max-width: 1024px) 100vw, 25vw"
            className="object-cover group-hover/card:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-navy-deep/10">
            <span className="text-gold-royal text-5xl opacity-30">🏨</span>
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
          <Badge
            variant="default"
            className={`px-3 py-1 text-[10px] font-bold border-0 ${
              property.listingStatus === 'forsale'
                ? 'bg-gold-royal text-white shadow-gold'
                : 'bg-navy-deep text-white'
            }`}
          >
            {property.listingStatus === 'forsale' ? 'For Sale' : property.listingStatus}
          </Badge>
          
          {constructionInfo && (
            <Badge
              variant="outline"
              className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border shadow-xs backdrop-blur-xs flex items-center gap-1 ${constructionInfo.color}`}
            >
              <span>{constructionInfo.icon}</span>
              <span>{constructionInfo.label}</span>
            </Badge>
          )}
        </div>

        {/* Premium Overlay on Hover */}
        <div className="absolute inset-0 bg-linear-to-t from-navy-deep/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

        {/* Animated Globe Indicator - Luxury Edition */}
        <div className="absolute bottom-4 left-4 right-4 z-20 opacity-0 transform translate-y-4 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-500 pointer-events-none">
          <div className="flex items-center gap-3 bg-navy-deep/60 backdrop-blur-xl text-white text-[11px] px-4 py-2 rounded-xl border border-white/10 shadow-navy">
            <div className="relative">
              <div className="absolute inset-0 bg-gold-royal rounded-full animate-ping opacity-75"></div>
              <Globe className="h-4 w-4 text-gold-royal relative z-10" />
            </div>
            <span className="font-bold">Interactive Global Map</span>
          </div>
        </div>
      </div>

      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Price & Type */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gold-royal mb-0.5">Investment Value</span>
            <span className="text-[22px] font-bold text-navy-deep leading-tight">
              {formatPrice(property.price, property.currency)}
            </span>
          </div>
          {property.propertyType && (
            <span className="text-[11px] font-bold text-navy-deep/50 border border-navy-deep/10 px-2.5 py-1 rounded-md bg-navy-deep/5">
              {typeof property.propertyType === 'object'
                ? property.propertyType.name.replace('_', ' ')
                : 'Property'}
            </span>
          )}
        </div>

        {/* Title/Address */}
        <h3 className="font-bold text-lg mb-1 line-clamp-1 text-navy-deep group-hover/card:text-gold-royal transition-colors duration-300">
          {property.title || property.street}
        </h3>

        {/* Location - Elegant Typography */}
        {address && (
          <div className="flex items-center text-navy-deep/60 text-sm mb-4 font-medium">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-gold-royal" />
            <span>
              {address.city}, {address.state}
            </span>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-navy-deep/5">
          {/* Property Short Details */}
          <div className="flex items-center justify-between text-[13px] font-bold text-navy-deep/80 mb-4.5 pt-0.5 pb-0.5">
            <div className="flex items-center gap-2">
              <Bed className="h-[18px] w-[18px] text-gold-royal" />
              <span>{property.details?.bedrooms || 0} Beds</span>
            </div>
            <div className="w-px  h-3.5 bg-navy-deep/10" />
            <div className="flex items-center gap-2">
              <Bath className="h-[18px] w-[18px] text-gold-royal" />
              <span>{property.details?.bathrooms || 0} Baths</span>
            </div>
            <div className="w-px  h-3.5 bg-navy-deep/10" />
            <div className="flex items-center gap-2">
              <Maximize className="h-[18px] w-[18px] text-gold-royal" />
              <span>{property.details?.squareMeters?.toLocaleString() || 0} Sq M</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3.5 pt-3 px-0.5 border-t border-dashed border-navy-deep/10 mt-2">
            <div className="text-[10px] font-bold text-navy-deep/40">Community Sync</div>
            <div className="flex items-center gap-2 z-30">
              <ViewsBadge minimal views={property.views ?? 0} />
            </div>
          </div>

          {/* Action Button - Luxury Styled */}
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              asChild
              className="w-full h-10 bg-navy-deep hover:bg-gold-royal text-white font-bold uppercase tracking-widest text-[9px] rounded-xl shadow-navy hover:shadow-gold transition-all duration-300 active:scale-95 group/btn"
            >
              <Link href={propertyUrl} className="flex items-center justify-center gap-2">
                Show Details
                <ChevronRight className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
