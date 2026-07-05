'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'
import { createPortal } from 'react-dom'

const SmartMap = dynamic(() => import('./smart-map').then((mod) => mod.SmartMap), {
  ssr: false,
})
import { Button } from '@/components/ui/button'
import { resolveGeoWithFallback } from '@/lib/geo/is-valid-coordinate'
import { formatPrice } from '@/lib/format-price'

// We need to type the property prop.
// For now, exporting GlobeDataPoint from search-results-map.tsx or redefining it here is needed.
// To avoid circular dependencies and keep it simple, we'll redefine the necessary fields or import it.
export interface MapPortalProperty {
  id: string | number
  realLat: number
  realLng: number
  title: string | null | undefined
  price: number | null | undefined
  currency?: string | null | undefined
  beds: number | null | undefined
  baths: number | null | undefined
  sqM: number | null | undefined
  type: string | null | undefined
  city: string | null | undefined
  state: string | null | undefined
  url: string
}

interface PropertyMapPortalProps {
  property: MapPortalProperty | null
  onClose: () => void
}

export function PropertyMapPortal({ property, onClose }: PropertyMapPortalProps) {
  // Only render on client where document is available
  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      <AnimatePresence>
        {property && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-9999 p-2 sm:p-8 pointer-events-none"
          >
            <div className="relative w-[95vw] sm:w-[90vw] max-w-7xl bg-navy-deep/95 backdrop-blur-3xl rounded-[32px] sm:rounded-[48px] border border-gold-royal/30 shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[96vh] sm:max-h-[90vh]">
              {/* Header */}
              <div className="flex justify-between items-center p-3 sm:p-10 border-b border-white/10">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gold-royal/20 border border-gold-royal/30 flex items-center justify-center">
                    <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-gold-royal" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl sm:text-2xl text-white tracking-tight">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-[9px] text-gold-royal font-bold uppercase tracking-[0.4em] opacity-80">
                        {(() => {
                          const resolved = resolveGeoWithFallback(
                            { lat: property.realLat, lng: property.realLng },
                            { city: property.city, state: property.state },
                          )
                          if (!resolved) return 'Location Pending'
                          if (resolved.precision === 'exact')
                            return `Satellite Lock: ${resolved.point.lat.toFixed(4)}N / ${resolved.point.lng.toFixed(4)}E`
                          return `${resolved.precision === 'city' ? 'City' : 'Region'} Approximation: ${resolved.point.lat.toFixed(2)}N / ${resolved.point.lng.toFixed(2)}E`
                        })()}
                      </p>
                      <div className="hidden sm:block h-1 w-1 rounded-full bg-gold-royal/50" />
                      <span className="hidden sm:inline-block text-[10px] text-white/50 font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                        {property.type?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-4 sm:p-5 bg-white/5 hover:bg-gold-royal text-white rounded-[20px] sm:rounded-[24px] transition-all duration-500 border border-white/10 group shadow-gold"
                >
                  <X className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-90 transition-transform duration-500" />
                </button>
              </div>

              {/* High-Resolution Spatial View - with Fallback Geolocation */}
              <div className="w-full relative group/map px-2 sm:px-8 bg-slate-900">
                <div
                  className="w-full rounded-[24px] sm:rounded-[40px] overflow-hidden border-4 border-white/5 shadow-inner relative"
                  style={{ height: 'clamp(350px, 55vh, 600px)' }}
                >
                  {(() => {
                    const resolved = resolveGeoWithFallback(
                      { lat: property.realLat, lng: property.realLng },
                      { city: property.city, state: property.state },
                    )
                    if (resolved) {
                      const zoom =
                        resolved.precision === 'exact'
                          ? 17
                          : resolved.precision === 'city'
                            ? 13
                            : 10
                      return (
                        <SmartMap
                          lat={resolved.point.lat}
                          lng={resolved.point.lng}
                          zoom={zoom}
                          title={property.title || 'Property Map'}
                          precision={resolved.precision}
                        />
                      )
                    }
                    return (
                      <div className="w-full h-full flex items-center justify-center bg-navy-deep/80">
                        <div className="text-center">
                          <MapPin className="w-12 h-12 text-gold-royal/30 mx-auto mb-4" />
                          <p className="text-white/50 text-sm font-medium">
                            Location data unavailable
                          </p>
                          <p className="text-white/30 text-xs mt-1">
                            Coordinates not set for this property
                          </p>
                        </div>
                      </div>
                    )
                  })()}

                </div>
              </div>

              {/* Summary & Call to Action */}
              <div className="p-4 sm:p-8 bg-white/5 backdrop-blur-md flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 sm:gap-12 text-center sm:text-left">
                  {/* Price Valuation */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase text-gold-royal">
                        Portfolio Valuation
                      </span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-bold text-white whitespace-nowrap">
                      {property.price ? formatPrice(property.price, property.currency) : 'Price upon request'}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block w-px h-10 bg-white/10 self-center" />

                  {/* Property Stats (Beds, Baths, Sq M) - Clear font, no letter-spacing */}
                  <div className="flex items-center gap-8 text-white">
                    <div className="text-center sm:text-left">
                      <p className="text-[11px] font-bold text-gold-royal mb-0.5">
                        Beds
                      </p>
                      <p className="text-xl sm:text-2xl font-bold">{property.beds || 0}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center sm:text-left">
                      <p className="text-[11px] font-bold text-gold-royal mb-0.5">
                        Baths
                      </p>
                      <p className="text-xl sm:text-2xl font-bold">{property.baths || 0}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center sm:text-left">
                      <p className="text-[11px] font-bold text-gold-royal mb-0.5">
                        Total Space
                      </p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {property.sqM?.toLocaleString() || 0} <span className="text-xs sm:text-sm font-medium text-white/60">Sq M</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 w-full lg:w-auto">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="hidden sm:inline-flex h-14 sm:h-16 px-6 sm:px-10 rounded-2xl border-white/10 bg-navy-deep/80 text-white hover:bg-white/5 font-bold uppercase transition-all"
                  >
                    Return to Globe
                  </Button>
                  <Button
                    onClick={() => (window.location.href = property.url)}
                    className="flex-1 lg:flex-initial bg-gold-royal hover:bg-white hover:text-navy-deep text-white px-8 sm:px-12 h-14 sm:h-16 rounded-2xl font-bold uppercase shadow-gold transition-all duration-500"
                  >
                    Full Details
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for Portal */}
      <AnimatePresence>
        {property && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-lg z-9998"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
    </>,
    document.body,
  )
}
