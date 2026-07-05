"use client"

import { Property } from "@/payload-types"
import { PropertySearchCard } from "./property-search-card"
import { motion } from "framer-motion"
import { useRef } from "react"
import { ChevronRight, ChevronLeft, Sparkles, Globe } from "lucide-react"

interface SearchResultsEliteProps {
  properties: Property[]
}

export function SearchResultsElite({ properties }: SearchResultsEliteProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  if (properties.length === 0) {
    return (
      <div className="h-[30vh] flex flex-col items-center justify-center text-center bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 mx-2">
        <div className="p-4 bg-gold-royal/10 rounded-2xl mb-4">
            <Globe className="h-8 w-8 text-gold-royal opacity-50" />
        </div>
        <p className="text-white/60 font-medium tracking-wide">No elite properties found in this region.</p>
        <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] mt-2">Try adjusting your filters for a wider reach</p>
      </div>
    )
  }

  return (
    <div className="relative scale-[0.9] origin-bottom sm:scale-100">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6 px-2 text-white/90">
        <div className="flex items-center gap-3">
            <div className="bg-gold-royal/20 p-2 rounded-xl">
                <Sparkles className="h-5 w-5 text-gold-royal" />
            </div>
            <div>
                <h3 className="text-lg font-bold tracking-tight">Curated Selection</h3>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">
                   {properties.length} Elite Assets
                </p>
            </div>
        </div>
        
        {/* Navigation Arrows */}
        <div className="hidden sm:flex items-center gap-2">
            <button 
                onClick={scrollLeft}
                className="w-10 h-10 rounded-xl border border-white/5 hover:bg-gold-royal/20 transition-all flex items-center justify-center group bg-white/5"
            >
                <ChevronLeft className="h-4 w-4 group-hover:scale-110" />
            </button>
            <button 
                onClick={scrollRight}
                className="w-10 h-10 rounded-xl border border-white/5 hover:bg-gold-royal/20 transition-all flex items-center justify-center group bg-white/5"
            >
                <ChevronRight className="h-4 w-4 group-hover:scale-110" />
            </button>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {properties.map((property) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="min-w-[280px] md:min-w-[320px] snap-center"
          >
            <PropertySearchCard property={property} />
          </motion.div>
        ))}
      </div>
      
      {/* Subtle Bottom Glow */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gold-royal/20 blur-xl rounded-full" />
    </div>
  )
}
