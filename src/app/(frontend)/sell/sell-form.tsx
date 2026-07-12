'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, Send } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamically load Leaflet Location Picker to bypass Server-Side Rendering (SSR) issues
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

interface SellFormProps {
  propertyTypeOptions?: Array<{ label: string; value: number }>
  currentUser?: {
    full_name: string
    email: string
    phone: string
  } | null
}

export function SellForm({ propertyTypeOptions = [], currentUser: _currentUser = null }: SellFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const submitLock = useRef(false)

  // Map Picker State - centered on Sharm El Sheikh by default
  const [coords, setCoords] = useState({ lat: 27.9158, lng: 34.3300 })
  const [addressDetails, setAddressDetails] = useState({
    address: '',
    city: '',
    state: '',
    country: 'Egypt',
  })

  const handleLocationChange = (data: {
    lat: number
    lng: number
    address: string
    city: string
    state: string
    country: string
  }) => {
    setCoords({ lat: data.lat, lng: data.lng })
    setAddressDetails({
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitLock.current) return
    submitLock.current = true
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
    const data = {
      property_type: formData.get('property_type'),
      property_title: formData.get('property_title'),
      property_description: formData.get('property_description'),
      property_location: formData.get('property_location'),
      city: formData.get('city'),
      state: formData.get('state'),
      country: formData.get('country'),
      asking_price: formData.get('asking_price'),
      currency: formData.get('currency'),
      property_size: formData.get('property_size'),
      bedrooms: formData.get('bedrooms'),
      bathrooms: formData.get('bathrooms'),
      constructionStatus: formData.get('constructionStatus'),
      latitude: formData.get('latitude'),
      longitude: formData.get('longitude'),
      google_maps_url: googleMapsUrl,
    }

    try {
      const res = await fetch('/api/seller-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Something went wrong')
        submitLock.current = false
        return
      }

      setIsSuccess(true)
    } catch (_err) {
      setError('Failed to submit request. Please try again.')
      submitLock.current = false
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="container w-full mx-auto max-w-7xl border-none shadow-2xl-soft rounded-[40px] overflow-hidden">
        <CardContent className="p-12 text-center bg-white">
          <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6 animate-bounce" />
          <h2 className="text-3xl font-bold mb-3 text-navy-deep">Request Submitted Successfully!</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
            Thank you for your interest in listing your property with FIMAC Group. Our team will
            review your request and contact you within 24-48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => {
                setIsSuccess(false)
                setError('')
                submitLock.current = false
                setCoords({ lat: 27.9158, lng: 34.3300 })
                setAddressDetails({
                  address: '',
                  city: '',
                  state: '',
                  country: 'Egypt',
                })
              }}
              className="w-full sm:w-auto px-8 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl transition-all duration-300"
            >
              Sell Another Property
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto px-8 py-3 border-2 border-blue-900 text-blue-900 hover:bg-blue-50 font-bold rounded-xl transition-all duration-300"
            >
              <Link href="/dashboard/seller">Go to Your Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-2xl-soft rounded-[40px] overflow-hidden">
      <div className="bg-navy-deep p-8 text-white">
        <h2 className="text-3xl font-bold mb-3">Property Listing Request</h2>
        <p className="text-white/70 leading-relaxed">
          Please provide comprehensive details about your asset. Note that all listings must adhere
          to our
          <span className="text-gold-royal font-bold"> Elite Standards</span>, including mandatory
          international valuation files and HD photography.
        </p>
      </div>
      <CardContent className="p-8 md:p-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Property Details */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-blue-900 border-b pb-2">
              Property Location & Details
            </h3>

            {/* Interactive Location Map Picker */}
            <div className="mb-8 space-y-3">
              <Label className="text-base font-bold text-navy-deep">Pinpoint Property Location *</Label>
              <p className="text-xs text-gray-500">
                Type your address to jump, then drag and drop the pin directly onto your property to automatically lock accurate coordinates and address details.
              </p>
              <LocationPicker value={coords} onChange={handleLocationChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type *</Label>
                <Select name="property_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_title">Property Title *</Label>
                <Input
                  id="property_title"
                  name="property_title"
                  required
                  placeholder="e.g. Grand Hotel Downtown"
                />
              </div>

              {/* Location Snapshot */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="property_location">Address / Street *</Label>
                <Input
                  id="property_location"
                  name="property_location"
                  required
                  placeholder="e.g. 14 El-Salam St."
                  value={addressDetails.address}
                  onChange={(e) => setAddressDetails({ ...addressDetails, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    required
                    placeholder="e.g. Sharm El Sheikh"
                    value={addressDetails.city}
                    onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / Region *</Label>
                  <Input
                    id="state"
                    name="state"
                    required
                    placeholder="e.g. South Sinai"
                    value={addressDetails.state}
                    onChange={(e) => setAddressDetails({ ...addressDetails, state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    required
                    placeholder="e.g. Egypt"
                    value={addressDetails.country}
                    onChange={(e) => setAddressDetails({ ...addressDetails, country: e.target.value })}
                  />
                </div>
              </div>

              {/* Satellite Coordinates lock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude (Satellite Lock) *</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    readOnly
                    className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed font-medium"
                    value={coords.lat}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude (Satellite Lock) *</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    readOnly
                    className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed font-medium"
                    value={coords.lng}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="property_description">Description *</Label>
                <Textarea
                  id="property_description"
                  name="property_description"
                  required
                  rows={5}
                  placeholder="Describe your property including key features, current condition, and any relevant details..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="asking_price">Asking Price *</Label>
                  <Input
                    id="asking_price"
                    name="asking_price"
                    type="number"
                    required
                    placeholder="e.g. 5000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select name="currency" defaultValue="USD" required>
                    <SelectTrigger>
                      <SelectValue placeholder="USD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EGP">EGP (E£)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="property_size">Size (Sq M)</Label>
                  <Input
                    id="property_size"
                    name="property_size"
                    type="number"
                    placeholder="e.g. 450"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    placeholder="e.g. 4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    placeholder="e.g. 3"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="constructionStatus">Construction Status *</Label>
                <Select name="constructionStatus" defaultValue="ready" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Ready to Move In" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ready">Ready to Move In</SelectItem>
                    <SelectItem value="under_construction">Under Construction</SelectItem>
                    <SelectItem value="brand_new">Brand New (First Occupancy)</SelectItem>
                    <SelectItem value="off_plan">Off-Plan</SelectItem>
                    <SelectItem value="renovated">Fully Renovated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 text-lg"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Submit Listing Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

