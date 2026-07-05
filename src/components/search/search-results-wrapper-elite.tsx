"use client"

import { SearchResultsElite } from "./search-results-elite"
import { Property } from "@/payload-types"
import dynamic from "next/dynamic"

const AnimatedGlobe = dynamic(
  () => import("./search-results-map").then((mod) => mod.AnimatedGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 text-white rounded-xl animate-pulse border border-gold-royal/20">
        <div className="w-24 h-24 rounded-full border-t-2 border-gold-royal animate-spin mb-6"></div>
        <p className="text-gold-royal font-black uppercase tracking-[0.3em] text-xs">
          Synchronizing Global Vision...
        </p>
      </div>
    ),
  },
)

interface SearchResultsWrapperEliteProps {
  properties: Property[]
}

export function SearchResultsWrapperElite({ properties }: SearchResultsWrapperEliteProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Expansive Unified "Space" Container */}
      <div className="relative w-full h-[90vh] lg:h-[95vh] rounded-[1rem] overflow-hidden border border-white/10 bg-slate-950 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col">
        {/* Layer 0: The Globe (Full Background) */}
        <div className="absolute inset-0 z-0">
          <AnimatedGlobe properties={properties} variant="minimal" />

          {/* Global Ambient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/60 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(161,128,82,0.05)_0%,transparent_70%)] pointer-events-none" />
        </div>

        {/* Layer 2: Floating Carousel (Bottom Overlay) */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-10 pointer-events-none">
          <div className="w-full pointer-events-auto">
            <SearchResultsElite properties={properties} />
          </div>
        </div>
      </div>
    </div>
  )
}
