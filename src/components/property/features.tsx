"use client"
import { useProperty } from "../providers/property"

export const PropertyFeatures = () => {
  const property = useProperty()
  const features = property.features

  if (!features || features.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm-soft border border-gray-100/50">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-navy-deep leading-none mb-6">Features & Amenities</h2>
        </div>
        <div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-gray-700">
            {features.map((feature) => (
              <li key={feature.id} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gold-royal shrink-0" />
                <span className="text-base font-medium text-slate-700">{feature.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
