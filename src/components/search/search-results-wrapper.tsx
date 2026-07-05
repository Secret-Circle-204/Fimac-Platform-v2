"use client"

import { useState, useEffect } from "react"
import { SearchResults } from "./search-results"
import { MobileSearchFAB } from "./mobile-search-fab"
import { Property } from "@/payload-types"
import dynamic from "next/dynamic"
import { PropertyMapPortal, MapPortalProperty } from "./property-map-portal"
import { buildPropertyUrl } from "@/repository/property/generate-url"

const AnimatedGlobe = dynamic(
  () => import("./search-results-map").then((mod) => mod.AnimatedGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 text-white rounded-3xl animate-pulse border border-gold-royal/20">
        <div className="w-24 h-24 rounded-full border-t-2 border-gold-royal animate-spin mb-6"></div>
        <p className="text-gold-royal font-black uppercase tracking-[0.3em] text-xs">
          Synchronizing Global Vision...
        </p>
      </div>
    ),
  },
)

interface SearchResultsWrapperProps {
  properties: Property[]
}

export function SearchResultsWrapper({ properties }: SearchResultsWrapperProps) {
  const [activeView, setActiveView] = useState<"list" | "map">("list")
  const [isDesktop, setIsDesktop] = useState(false)
  const [activePortalProperty, setActivePortalProperty] = useState<MapPortalProperty | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const handleViewChange = (e: Event) => {
      const customEvent = e as CustomEvent<"list" | "map">
      setActiveView(customEvent.detail)
    }

    window.addEventListener("search-view-change", handleViewChange)
    return () => window.removeEventListener("search-view-change", handleViewChange)
  }, [])

  useEffect(() => {
    const handleCardClick = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string; lat: number; lng: number }>
      if (!customEvent.detail) return

      const { id } = customEvent.detail
      
      // On mobile/tablet, intercept and open the PropertyMapPortal modal directly
      if (window.innerWidth < 1024) {
        const found = properties.find((p) => p.id === id)
        if (found) {
          const address = typeof found.location === 'object' ? found.location?.address : null
          const geo = typeof found.location === 'object' ? found.location?.geo : null
          
          const propertyUrl =
            (found as unknown as { url?: string }).url ||
            buildPropertyUrl(found.id, address || { street: found.street })
          
          setActivePortalProperty({
            id: found.id,
            realLat: geo?.lat ?? 0,
            realLng: geo?.lng ?? 0,
            title: found.title,
            price: found.price,
            currency: found.currency,
            beds: found.details?.bedrooms,
            baths: found.details?.bathrooms,
            sqM: found.details?.squareMeters,
            type: typeof found.propertyType === 'object' && found.propertyType !== null ? found.propertyType.name : undefined,
            city: address?.city || found.street,
            state: address?.state,
            url: propertyUrl,
          })
        }
      }
    }

    window.addEventListener("card-property-click", handleCardClick)
    return () => window.removeEventListener("card-property-click", handleCardClick)
  }, [properties])

  return (
    <>
      <div className="flex flex-col lg:flex-row h-full lg:min-h-[calc(100vh-160px)]">
        {/* Left Side: Search Controls & Results (Scrollable on Desktop) */}
        {/* On Mobile: Hidden if Map view is active */}
        <div
          className={`w-full lg:w-[55%] flex-col h-auto lg:h-[calc(100vh-160px)] lg:overflow-y-auto lg:border-r border-navy-deep/5 bg-[#FDFCFB] z-10 ${
            activeView === "list" ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="px-2 py-6 sm:p-8 flex-1 bg-gray-50/30">
            <SearchResults properties={properties} />
          </div>
        </div>

        {/* Right Side: Interactive Map (Fixed) */}
        {/* On Mobile: Hidden if List view is active */}
        <div
          className={`w-full lg:w-[45%] h-[calc(100vh-160px)] lg:sticky lg:top-[120px] bg-navy-deep ${
            activeView === "map" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="w-full h-full relative">
            {(isDesktop || activeView === "map") && (
              <AnimatedGlobe properties={properties} variant="minimal" />
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile Toggle */}
      <MobileSearchFAB />

      {/* Mobile-only Direct Property Map Portal */}
      <PropertyMapPortal
        property={activePortalProperty}
        onClose={() => setActivePortalProperty(null)}
      />
    </>
  )
}
