'use client'

import { SpecFieldDefinition } from '@/collections/Properties/specs-registry'

interface FeatureOption {
  label: string
  value: number | string
  slug: string
}

interface CustomSpec {
  label: string
  icon?: string
  valueType: 'text' | 'number' | 'date' | 'boolean' | 'url'
  value: string
}

interface ReviewStepProps {
  selectedCategoryName: string
  selectedPropertyTypeName: string
  propertyTitle: string
  constructionStatus: string
  askingPrice: string
  currency: string
  propertySize: string
  addressDetails: {
    address: string
    city: string
    state: string
    country: string
  }
  coords: { lat: number; lng: number }
  description: string
  activeSpecs: SpecFieldDefinition[]
  specValues: Record<string, unknown>
  featureOptions: FeatureOption[]
  selectedFeatures: Array<number | string>
  customFeatures: string[]
  customSpecs?: CustomSpec[]
}

export function ReviewStep({
  selectedCategoryName,
  selectedPropertyTypeName,
  propertyTitle,
  constructionStatus,
  askingPrice,
  currency,
  propertySize,
  addressDetails,
  coords,
  description,
  activeSpecs,
  specValues,
  featureOptions,
  selectedFeatures,
  customFeatures,
  customSpecs = [],
}: ReviewStepProps) {
  const formattedConstructionStatus = () => {
    switch (constructionStatus) {
      case 'ready':
        return 'Ready to Move In'
      case 'under_construction':
        return 'Under Construction'
      case 'brand_new':
        return 'Brand New (First Occupancy)'
      case 'off_plan':
        return 'Off-Plan'
      case 'renovated':
        return 'Fully Renovated'
      default:
        return constructionStatus
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b pb-3 border-slate-100">
        <h3 className="text-xl font-bold text-navy-deep">Review Listing Details</h3>
        <p className="text-xs text-slate-400 mt-1">
          Review all information below before submitting your property request.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-navy-deep">
        {/* Core Details Card */}
        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/80 space-y-4 shadow-sm">
          <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Asset Information
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-slate-100 pb-2 text-sm">
              <span className="text-slate-500 font-medium">Category</span>
              <span className="font-semibold">{selectedCategoryName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2 text-sm">
              <span className="text-slate-500 font-medium">Property Type</span>
              <span className="font-semibold">{selectedPropertyTypeName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2 text-sm">
              <span className="text-slate-500 font-medium">Title</span>
              <span className="font-semibold text-right">{propertyTitle}</span>
            </div>
            <div className="flex justify-between pb-1 text-sm">
              <span className="text-slate-500 font-medium">Construction Status</span>
              <span className="font-semibold">{formattedConstructionStatus()}</span>
            </div>
          </div>
        </div>

        {/* Financial & Dimension Card */}
        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/80 space-y-4 shadow-sm">
          <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Pricing & Size
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-100 pb-3 text-sm">
              <span className="text-slate-500 font-medium">Asking Price</span>
              <span className="font-bold text-blue-900 text-xl">
                {Number(askingPrice).toLocaleString()} {currency}
              </span>
            </div>
            <div className="flex justify-between pb-1 text-sm">
              <span className="text-slate-500 font-medium">Property Size</span>
              <span className="font-semibold text-lg text-navy-deep">
                {propertySize} m²
              </span>
            </div>
          </div>
        </div>

        {/* Location Snapshot Card */}
        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/80 space-y-4 md:col-span-2 shadow-sm">
          <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Location Snapshot
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between border-b border-slate-100 pb-2 text-sm">
                <span className="text-slate-500 font-medium">Address</span>
                <span className="font-semibold text-right">{addressDetails.address}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 text-sm">
                <span className="text-slate-500 font-medium">City</span>
                <span className="font-semibold">{addressDetails.city}</span>
              </div>
              <div className="flex justify-between pb-1 text-sm">
                <span className="text-slate-500 font-medium">Country</span>
                <span className="font-semibold">{addressDetails.country}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-slate-100 pb-2 text-sm">
                <span className="text-slate-500 font-medium">Latitude</span>
                <span className="font-semibold font-mono text-slate-600">{coords.lat.toFixed(6)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 text-sm">
                <span className="text-slate-500 font-medium">Longitude</span>
                <span className="font-semibold font-mono text-slate-600">{coords.lng.toFixed(6)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Card */}
        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/80 space-y-3 md:col-span-2 shadow-sm">
          <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Detailed Description
          </h4>
          <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap font-medium">
            {description}
          </p>
        </div>

        {/* Dynamic Specifications Summary */}
        {(activeSpecs.length > 0 || customSpecs.length > 0) && (
          <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/80 space-y-4 md:col-span-2 shadow-sm">
            <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Property Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activeSpecs.map((spec) => {
                const rawVal = specValues[spec.path]
                if (
                  rawVal === undefined ||
                  rawVal === null ||
                  rawVal === '' ||
                  rawVal === false ||
                  rawVal === 'false' ||
                  rawVal === 'No' ||
                  rawVal === 'no'
                ) {
                  return null
                }

                let displayVal = '—'

                if (spec.type === 'checkbox') {
                  displayVal = rawVal ? 'Yes' : 'No'
                } else if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
                  const stringVal = String(rawVal)
                  displayVal = spec.type === 'select'
                    ? spec.selectOptions?.find(o => o.value === rawVal)?.label || stringVal
                    : `${stringVal}${spec.unit ? ` ${spec.unit}` : ''}`
                }

                return (
                  <div key={spec.path} className="flex flex-col p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{spec.label.en}</span>
                    <span className="font-bold text-navy-deep mt-1 text-sm">{displayVal}</span>
                  </div>
                )
              })}

              {/* Custom Specifications */}
              {customSpecs.map((spec, index) => {
                let displayVal = spec.value
                if (spec.valueType === 'boolean') {
                  displayVal = spec.value === 'true' || spec.value === 'Yes' ? 'Yes' : 'No'
                }
                return (
                  <div key={`custom-spec-${index}`} className="flex flex-col p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      {spec.label} <span className="text-[9px] text-slate-300 font-bold">(Custom)</span>
                    </span>
                    <span className="font-bold text-navy-deep mt-1 text-sm">{displayVal}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Features Summary */}
        {(selectedFeatures.length > 0 || customFeatures.length > 0) && (
          <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/80 space-y-4 md:col-span-2 shadow-sm">
            <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Property Features
            </h4>
            <div className="flex flex-wrap gap-2">
              {/* Selected Existing Features */}
              {selectedFeatures.map((featId) => {
                const feat = featureOptions.find((o) => o.value === featId || Number(o.value) === Number(featId))
                if (!feat) return null
                return (
                  <span
                    key={feat.value}
                    className="inline-flex items-center bg-blue-900/10 text-blue-900 text-sm font-semibold px-4 py-2 rounded-full border border-blue-900/20 animate-fadeIn"
                  >
                    {feat.label}
                  </span>
                )
              })}

              {/* Custom Features */}
              {customFeatures.map((feat, index) => (
                <span
                  key={`custom-${index}`}
                  className="inline-flex items-center bg-slate-100 text-navy-deep text-sm font-semibold px-4 py-2 rounded-full border border-slate-200 animate-fadeIn"
                >
                  {feat} (Custom)
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
