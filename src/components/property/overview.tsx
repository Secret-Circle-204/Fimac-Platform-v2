"use client"

import { PropertyDescription } from './description'
import { useProperty } from '../providers/property'
import { LucideIcon, Calendar, Home, Move, Thermometer, Info, Bed, Bath, Maximize } from 'lucide-react'

export const PropertyOverview = () => {
  const property = useProperty()

  // Build specifications list dynamically from property details
  const specs = [
    {
      label: "Property Type",
      value: property.details?.Property || "Property",
      icon: Home,
    },
    {
      label: "Bedrooms",
      value: property.details?.bedrooms ? `${property.details.bedrooms} Beds` : null,
      icon: Bed,
    },
    {
      label: "Bathrooms",
      value: property.details?.bathrooms ? `${property.details.bathrooms} Baths` : null,
      icon: Bath,
    },
    {
      label: "Area (Space)",
      value: property.details?.squareMeters && property.details.squareMeters !== "0" ? `${property.details.squareMeters} Sq M` : null,
      icon: Maximize,
    },
    property.details?.lotSize && property.details.lotSize !== "0" && {
      label: "Lot Size",
      value: `${property.details.lotSize} Sq M`,
      icon: Move,
    },
    property.details?.yearBuilt && property.details.yearBuilt > 0 && {
      label: "Year Built",
      value: property.details.yearBuilt,
      icon: Calendar,
    },
    property.details?.heatingType && {
      label: "Climate Control",
      value: property.details.heatingType,
      icon: Thermometer,
    },
  ].filter(Boolean) as { label: string; value: string | number; icon: LucideIcon }[]

  return (
    <div className="bg-white rounded-[32px] border border-navy-deep/5 shadow-2xl-soft p-8 md:p-12 flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gold-royal/10 text-gold-royal">
            <Info className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-navy-deep tracking-tight">Property Overview</h2>
        </div>
        <div className="text-navy-deep/70 leading-relaxed text-lg pl-1">
          <PropertyDescription />
        </div>
      </div>

      {specs.length > 0 && (
        <>
          <div className="h-px bg-slate-100 w-full" />

          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-navy-deep tracking-tight">Property Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {specs.map((spec, index) => {
                const IconComponent = spec.icon
                return (
                  <div
                    key={index}
                    className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-4 transition-all duration-300 hover:bg-slate-100 hover:border-gold-royal/20 hover:-translate-y-1 hover:shadow-lg-soft"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gold-royal/10 text-gold-royal flex items-center justify-center">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-navy-deep/40 mb-1">
                        {spec.label}
                      </p>
                      <p className="font-bold text-navy-deep text-lg">{spec.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
