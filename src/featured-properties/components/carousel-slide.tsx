'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  BedDoubleIcon,
  BathIcon,
  RulerIcon,
  MapPin,
  Expand,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { ViewsBadge } from '@/components/property/views-badge'

type PropertyImage = { url: string; alt: string }

export type CarouselProperty = {
  id: string | number
  title: string
  url: string
  price: string
  images: PropertyImage[]
  address: { city?: string | null; state_abbr?: string | null }
  details: { bedrooms: number; bathrooms: number; sqM: string }
  propertyType?: string | null
  views?: number
}

export function CarouselSlide({
  property,
  offset,
  isCenter,
  imageIndex,
  dragDelta,
  onClick,
  onOpenFullscreen,
  onNavigate,
}: {
  property: CarouselProperty
  offset: number
  isCenter: boolean
  imageIndex: number
  dragDelta: number
  onClick: () => void
  onOpenFullscreen: (imgIndex: number) => void
  onNavigate?: (dir: -1 | 1) => void
}) {
  const absOffset = Math.abs(offset)
  const translateX = offset * 320 + dragDelta
  const translateZ = isCenter ? 0 : -200 - absOffset * 80
  const rotateY = offset * -25
  const scale = isCenter ? 1 : 0.7 - absOffset * 0.08
  const opacity = isCenter ? 1 : 0.5 - absOffset * 0.15
  const blur = isCenter ? 0 : 2 + absOffset * 1.5

  const safeImageIndex =
    property.images.length > 0 ? Math.min(Math.max(imageIndex, 0), property.images.length - 1) : 0

  const currentImage = property.images[safeImageIndex] ?? property.images[0]

  return (
    <div
      // className={`carousel3d-slide ${isCenter ? 'carousel3d-slide--center' : ''} w-[calc(100vw-24px)]! md:w-[680px]! ml-[calc(-50vw+12px)]! md:ml-[-340px]!`}
      className={`carousel3d-slide ${isCenter ? 'carousel3d-slide--center' : ''}`}
      style={{
        transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
        opacity: Math.max(opacity, 0),
        filter: `blur(${blur}px)`,
        zIndex: 10 - absOffset,
      }}
      onClick={onClick}
    >
      {/* Main image with slideshow */}
      <div className="carousel3d-image-wrap">
        {!currentImage?.url ? (
          <div className="w-full h-full bg-gradient-to-b from-navy-deep/10 via-navy-deep/20 to-navy-deep/40 flex flex-col items-center justify-center gap-4 border border-dashed border-gold-royal/30 backdrop-blur-sm select-none relative overflow-hidden">
            {/* Futuristic Holographic Glowing Ring */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-gold-royal/10 animate-[ping_3s_infinite_ease-in-out]" />
              <div className="absolute inset-0 rounded-full border border-dashed border-gold-royal/30 animate-[spin_20s_linear_infinite]" />
              <div className="w-14 h-14 rounded-full bg-navy-deep/40 backdrop-blur-md flex items-center justify-center border border-gold-royal/40 shadow-[0_0_20px_rgba(191,155,88,0.15)]">
                <Sparkles className="h-6 w-6 text-gold-royal animate-pulse drop-shadow-[0_0_8px_rgba(191,155,88,0.6)]" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 z-10">
              <span className="text-gold-royal font-bold text-[11px] tracking-[0.25em] uppercase">
                Imagery Initializing
              </span>
              <span className="text-white/40 text-[9px] font-medium">
                High-Fidelity Rendering Soon
              </span>
            </div>
          </div>
        ) : isCenter ? (
          property.images.map((img, i) =>
            img.url && Math.abs(i - safeImageIndex) <= 1 ? (
              <Image
                key={`${property.id}-img-${i}`}
                src={img.url}
                alt={img.alt || property.title}
                fill
                className={`carousel3d-image ${i === safeImageIndex ? 'carousel3d-image--visible' : ''}`}
                priority={i === 0 || i === safeImageIndex}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 680px"
              />
            ) : null,
          )
        ) : (
          <Image
            src={currentImage.url}
            alt={currentImage?.alt ?? property.title}
            fill
            className="carousel3d-image carousel3d-image--visible"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 680px"
          />
        )}

        {/* Image counter */}
        {isCenter && property.images.length > 1 && (
          <div className="carousel3d-image-counter">
            {safeImageIndex + 1} / {property.images.length}
          </div>
        )}

        {/* Fullscreen button */}
        {isCenter && (
          <button
            className="carousel3d-fullscreen-btn"
            onClick={(e) => {
              e.stopPropagation()
              onOpenFullscreen(safeImageIndex)
            }}
            aria-label="Open fullscreen gallery"
          >
            <Expand size={18} />
          </button>
        )}

        {/* Property type badge */}
        {property.propertyType && <div className="carousel3d-badge">{property.propertyType}</div>}

        {/* Bottom gradient */}
        <div className="carousel3d-gradient" />
      </div>

      {/* Info overlay */}
      <div className="carousel3d-info">
        <div className="carousel3d-info-row">
          <div>
            <h3 className="carousel3d-property-title">{property.title}</h3>
            {property.address.city && (
              <p className="carousel3d-location">
                <MapPin size={14} />
                {property.address.city}
                {property.address.state_abbr && `, ${property.address.state_abbr}`}
              </p>
            )}
          </div>
          <div className="carousel3d-price">{property.price}</div>
        </div>

        <div className="carousel3d-stats">
          <span>
            <BedDoubleIcon size={16} /> {property.details.bedrooms} Beds
          </span>
          <span>
            <BathIcon size={16} /> {property.details.bathrooms} Baths
          </span>
          <span>
            <RulerIcon size={16} /> {property.details.sqM} Sq M
          </span>
        </div>

        <div className="carousel3d-actions">
          <Link
            href={property.url}
            className="carousel3d-cta"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            View Property Details
          </Link>

          <div className="flex items-center gap-2 z-20">
            <ViewsBadge views={property.views || 0} minimal />
          </div>
        </div>
      </div>

      {/* ═══ MINIMAL ARROW NAVIGATION — Mobile Only ═══ */}
      {isCenter && onNavigate && (
        <>
          <button
            className="mobile-nav-arrow mobile-nav-arrow--prev"
            onClick={(e) => {
              e.stopPropagation()
              onNavigate(-1)
            }}
            aria-label="Previous"
          >
            <ChevronLeft strokeWidth={2} />
          </button>

          <button
            className="mobile-nav-arrow mobile-nav-arrow--next"
            onClick={(e) => {
              e.stopPropagation()
              onNavigate(1)
            }}
            aria-label="Next"
          >
            <ChevronRight strokeWidth={2} />
          </button>
        </>
      )}
    </div>
  )
}
