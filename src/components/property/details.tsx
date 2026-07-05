"use client"

import { PropertyStatus } from "./status"
import { PropertyConstructionStatus } from "./construction-status"
import { PropertyShare } from "./share"
import { PropertyAddress } from "./address"
import { useProperty } from "../providers/property"
import { MapPin } from "lucide-react"

export const PropertyDetails = () => {
  const property = useProperty()
  
  // property.price is always a formatted string from PropertyDecorator (e.g. "$500,000")
  const priceFormatted = property.price

  const handleScrollToMap = () => {
    const element = document.getElementById("property-map-section")
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
      // Briefly highlight the map card for visual feedback
      element.classList.add("ring-2", "ring-gold-royal", "ring-offset-2")
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-gold-royal", "ring-offset-2")
      }, 2000)
    }
  }

  return (
    <div className="bg-white rounded-[32px] border border-navy-deep/5 shadow-2xl-soft p-8 md:p-12 flex flex-col md:flex-row items-start justify-between gap-8">
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <PropertyStatus />
            <PropertyConstructionStatus />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-navy-deep/40">
              Verified Listing
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-navy-deep tracking-tight">
            {property.title}
          </h1>
        </div>

        <div onClick={handleScrollToMap} className="flex items-center gap-2 group cursor-pointer w-fit">
          <div className="p-2 rounded-xl bg-gold-royal/10 text-gold-royal transition-colors group-hover:bg-gold-royal group-hover:text-white">
            <MapPin className="w-4 h-4" />
          </div>
          <PropertyAddress />
        </div>

        <div className="pt-4 border-t border-slate-100/80 w-full">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-royal">
              Listing Price
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-navy-deep tracking-tight">
              {priceFormatted}
            </h3>
          </div>
        </div>
      </div>

      <div className="flex md:flex-col gap-3">
        <PropertyShare />
      </div>
    </div>
  )
}
