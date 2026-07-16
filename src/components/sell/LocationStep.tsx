'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MapPin, Globe, Compass, Landmark } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically load Location Picker to bypass SSR issues
const LocationPicker = dynamic(
  () => import('@/components/sell/location-picker').then((mod) => mod.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] md:h-[400px] w-full bg-slate-50 animate-pulse rounded-2xl flex items-center justify-center text-gray-400 font-bold border border-dashed border-gray-200">
        Loading Interactive Location Map...
      </div>
    ),
  }
)

interface LocationStepProps {
  coords: { lat: number; lng: number }
  addressDetails: {
    address: string
    city: string
    state: string
    country: string
    zip: string
  }
  onLocationChange: (data: {
    lat: number
    lng: number
    address: string
    city: string
    state: string
    country: string
    zip: string
  }) => void
  onAddressDetailsChange: (details: {
    address: string
    city: string
    state: string
    country: string
    zip: string
  }) => void
}

export function LocationStep({
  coords,
  addressDetails,
  onLocationChange,
  onAddressDetailsChange,
}: LocationStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b pb-3 border-slate-100">
        <h3 className="text-xl font-bold text-navy-deep">Asset Location & Address</h3>
        <p className="text-xs text-slate-400 mt-1">
          Pinpoint the property location on the map, and write the address details below.
        </p>
      </div>

      {/* Interactive Location Map Picker */}
      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
          Pinpoint Property Location <span className="text-red-500 ml-1 font-bold">*</span>
        </Label>
        <p className="text-xs text-slate-400">
          Type your address to jump, then drag and drop the pin directly onto your property to automatically lock accurate coordinates and address details.
        </p>
        <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-md">
          <LocationPicker value={coords} onChange={onLocationChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="property_location" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            Address / Street <span className="text-red-500 ml-1 font-bold">*</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
            <Input
              id="property_location"
              name="property_location"
              value={addressDetails.address}
              onChange={(e) => onAddressDetailsChange({ ...addressDetails, address: e.target.value })}
              required
              className="h-14 border-slate-200 focus:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-base font-semibold text-navy-deep pl-12 pr-4"
              placeholder="e.g. 14 El-Salam St."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
              City <span className="text-red-500 ml-1 font-bold">*</span>
            </Label>
            <div className="relative">
              <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
              <Input
                id="city"
                name="city"
                value={addressDetails.city}
                onChange={(e) => onAddressDetailsChange({ ...addressDetails, city: e.target.value })}
                required
                className="h-14 border-slate-200 focus:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-base font-semibold text-navy-deep pl-12 pr-4"
                placeholder="e.g. Sharm El Sheikh"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="state" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
              State / Region <span className="text-red-500 ml-1 font-bold">*</span>
            </Label>
            <div className="relative">
              <Compass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
              <Input
                id="state"
                name="state"
                value={addressDetails.state}
                onChange={(e) => onAddressDetailsChange({ ...addressDetails, state: e.target.value })}
                required
                className="h-14 border-slate-200 focus:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-base font-semibold text-navy-deep pl-12 pr-4"
                placeholder="e.g. South Sinai"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
              Country <span className="text-red-500 ml-1 font-bold">*</span>
            </Label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
              <Input
                id="country"
                name="country"
                value={addressDetails.country}
                onChange={(e) => onAddressDetailsChange({ ...addressDetails, country: e.target.value })}
                required
                className="h-14 border-slate-200 focus:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-base font-semibold text-navy-deep pl-12 pr-4"
                placeholder="e.g. Egypt"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="zip" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Zip Code
            </Label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
              <Input
                id="zip"
                name="zip"
                value={addressDetails.zip || ''}
                onChange={(e) => onAddressDetailsChange({ ...addressDetails, zip: e.target.value })}
                className="h-14 border-slate-200 focus:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-base font-semibold text-navy-deep pl-12 pr-4"
                placeholder="e.g. 46619"
              />
            </div>
          </div>
        </div>

        {/* Satellite Coordinates lock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="latitude" className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Latitude (Satellite Lock)
            </Label>
            <Input
              id="latitude"
              name="latitude"
              readOnly
              className="h-14 bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed rounded-2xl font-mono text-sm px-4"
              value={coords.lat}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude" className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Longitude (Satellite Lock)
            </Label>
            <Input
              id="longitude"
              name="longitude"
              readOnly
              className="h-14 bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed rounded-2xl font-mono text-sm px-4"
              value={coords.lng}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
