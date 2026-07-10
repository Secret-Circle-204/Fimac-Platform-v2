'use client'

import { useProperty } from '@/components/providers/property'
import dynamic from 'next/dynamic'
import { resolveGeoWithFallback } from '@/lib/geo/is-valid-coordinate'

const SmartMap = dynamic(
  () => import('@/components/search/smart-map').then((mod) => mod.SmartMap),
  {
    ssr: false,
  },
)
import { MapPin, Lock, PhoneCall } from 'lucide-react'

export const PropertyMap = () => {
  const property = useProperty()

  // Resolve coordinates using the centralized helper
  const resolved = resolveGeoWithFallback(property.original.location?.geo, {
    city: property.address.city,
    state: property.address.state,
  })

  const handleScrollToInquiry = () => {
    const element = document.getElementById('property-inquiry-section')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Highlight the inquiry form briefly for visual feedback
      element.classList.add('ring-2', 'ring-gold-royal', 'ring-offset-2')
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-gold-royal', 'ring-offset-2')
      }, 2000)
    }
  }

  return (
    <div
      id="property-map-section"
      className="bg-white rounded-[32px] border border-navy-deep/5 shadow-2xl-soft overflow-hidden"
    >
      {/* Header with Padding */}
      <div className="p-8 md:p-12 pb-0 md:pb-0 flex flex-col gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-royal">
          Geospatial View
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-navy-deep tracking-tight">
          Location & Surroundings
        </h2>
      </div>

      {resolved ? (
        // Map Container - full width edge-to-edge on sides, margin-top to separate from header
        <div className="h-[600px] md:h-[800px] w-full mt-6 md:mt-8 relative shadow-inner border-t border-navy-deep/10 bg-slate-950">
          <SmartMap
            lat={resolved.point.lat}
            lng={resolved.point.lng}
            zoom={resolved.precision === 'exact' ? 17 : resolved.precision === 'city' ? 13 : 10}
            title={property.title || 'Property Location'}
            precision={resolved.precision}
          />
        </div>
      ) : (
        // Fallback Container - padded to center the undisclosed graphics card
        <div className="p-8 md:p-12 pt-6 md:pt-8">
          <div className="w-full min-h-[600px] md:min-h-[800px] bg-gradient-to-br from-navy-deep to-slate-900 rounded-2xl overflow-hidden border border-gold-royal/30 flex flex-col items-center justify-center p-8 text-center relative shadow-2xl">
            {/* Elegant Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(197,160,89,0.15),rgba(255,255,255,0))]" />

            {/* Premium Icon Assembly */}
            <div className="relative mb-6 z-10">
              <div className="w-20 h-20 rounded-full bg-gold-royal/10 border border-gold-royal/20 flex items-center justify-center animate-pulse">
                <MapPin className="w-10 h-10 text-gold-royal/80" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-navy-deep border border-gold-royal/40 flex items-center justify-center shadow-lg">
                <Lock className="w-4 h-4 text-gold-royal" />
              </div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-white tracking-wide mb-3 z-10">
              Location Map Undisclosed
            </h3>
            <p className="text-white/70 max-w-md text-sm leading-relaxed mb-6 z-10">
              No maps are currently available. will be available soon.
            </p>

            <button
              onClick={handleScrollToInquiry}
              className="group flex items-center gap-2.5 px-6 py-3 bg-gold-royal text-white rounded-xl font-semibold text-xs uppercase tracking-widest transition-all duration-300 hover:bg-gold-royal/90 active:scale-95 shadow-lg shadow-gold-royal/25 z-10"
            >
              <PhoneCall className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
              Contact Fimac Advisor
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
