'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Search, MapPin, Loader2 } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet marker icon URLs on client
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

// Custom Luxury Gold Pin Icon for Picker
const goldPinIcon = () => {
  if (typeof window === 'undefined') return null
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `
      <div class="relative flex items-center justify-center" style="width: 48px; height: 48px; margin-top: -12px;">
        <div class="absolute inset-0 rounded-full animate-ping opacity-35 bg-gold-royal" style="animation-duration: 2.5s;"></div>
        <div class="relative w-10 h-10 rounded-full shadow-lg flex items-center justify-center" 
             style="background-color: #072364; border: 2.5px solid #d4af37;">
          <div class="w-3.5 h-3.5 rounded-full bg-gold-royal"></div>
        </div>
        <div class="absolute -bottom-1 w-3 h-3 rotate-45 shadow-sm" 
             style="background-color: #072364; border-right: 2.5px solid #d4af37; border-bottom: 2.5px solid #d4af37; margin-top: -2px;"></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  })
}

interface LocationData {
  lat: number
  lng: number
  address: string
  city: string
  state: string
  country: string
  zip: string
}

interface LocationPickerProps {
  value: { lat: number; lng: number }
  onChange: (data: LocationData) => void
}

// Controller component to programmatically pan/zoom the Leaflet map view
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1 })
  }, [center, zoom, map])
  return null
}

// Floating button to reset map focus back to the marker position
function CenterOnPinButton({ position }: { position: [number, number] }) {
  const map = useMap()
  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          map.setView(position, 16, { animate: true, duration: 1 })
        }}
        className="w-10 h-10 bg-white hover:bg-slate-50 border border-gray-200/80 rounded-xl flex items-center justify-center shadow-lg text-blue-900 hover:text-gold-royal transition-all duration-300 active:scale-95 cursor-pointer"
        title="Recenter on Pin"
      >
        <MapPin className="w-5 h-5 text-gold-royal animate-pulse" />
      </button>
    </div>
  )
}

// Floating button to drop the marker pin at the center of the current screen view
function MovePinToCenterButton({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  const map = useMap()
  return (
    <div className="absolute bottom-4 right-4 z-[1000]">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          const center = map.getCenter()
          onMove(center.lat, center.lng)
        }}
        className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white border border-gold-royal/30 rounded-xl flex items-center gap-2 shadow-xl font-bold text-xs transition-all duration-300 active:scale-95 cursor-pointer whitespace-nowrap"
        title="Place Pin at current viewport center"
      >
        <MapPin className="w-4 h-4 text-gold-royal" />
        <span>Place Pin Here</span>
      </button>
    </div>
  )
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([value.lat, value.lng])
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([value.lat, value.lng])
  const [zoom, setZoom] = useState(12) // Default map zoom
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [geocodingError, setGeocodingError] = useState('')
  const [shouldRenderMap, setShouldRenderMap] = useState(false)
  const markerRef = useRef<L.Marker>(null)

  // Delay map mounting slightly to prevent Leaflet from mounting on a detached DOM node
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRenderMap(true)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  // Initialize map position on first mount once
  const isInitialized = useRef(false)
  useEffect(() => {
    if (!isInitialized.current && value.lat && value.lng) {
      const newPos: [number, number] = [value.lat, value.lng]
      setPosition(newPos)
      setMarkerPosition(newPos)
      isInitialized.current = true
    }
  }, [value.lat, value.lng])

  // Custom Gold Pin icon memoization
  const customIcon = useMemo(() => goldPinIcon() as L.DivIcon, [])

  // Geocoding: Address to Coordinates
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setGeocodingError('')

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&addressdetails=1&limit=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        const newPos: [number, number] = [lat, lng]
        setPosition(newPos)
        setMarkerPosition(newPos)
        setZoom(16) // Set higher zoom on search results to lock in location

        const addr = result.address || {}
        const parts = result.display_name ? result.display_name.split(',').map((p: string) => p.trim()) : []
        const country = addr.country || (parts.length > 0 ? parts[parts.length - 1] : '')
        const state = addr.state || addr.region || (parts.length > 1 ? parts[parts.length - 2] : '')
        const city = addr.city || addr.town || addr.village || addr.county || (parts.length > 2 ? parts[parts.length - 3] : '')
        const street = addr.road || addr.suburb || addr.pedestrian || addr.neighbourhood || ''

        const zip = addr.postcode || ''

        onChange({
          lat,
          lng,
          address: street,
          city,
          state,
          country,
          zip,
        })
      } else {
        setGeocodingError('Location not found. Please try a different search.')
      }
    } catch {
      setGeocodingError('Failed to contact search service. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  // Reverse Geocoding: Coordinates to Address
  const handleMarkerDragEnd = async () => {
    const marker = markerRef.current
    if (marker) {
      const latLng = marker.getLatLng()
      setMarkerPosition([latLng.lat, latLng.lng])

      // When dragging the marker, we only notify the parent of coordinate changes,
      // avoiding setPosition which triggers map center/zoom resets.

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latLng.lat}&lon=${latLng.lng}&addressdetails=1`
        )
        const data = await response.json()

        if (data && data.address) {
          const addr = data.address || {}
          const parts = data.display_name ? data.display_name.split(',').map((p: string) => p.trim()) : []
          const country = addr.country || (parts.length > 0 ? parts[parts.length - 1] : '')
          const state = addr.state || addr.region || (parts.length > 1 ? parts[parts.length - 2] : '')
          const city = addr.city || addr.town || addr.village || addr.county || (parts.length > 2 ? parts[parts.length - 3] : '')
          const street = addr.road || addr.suburb || addr.pedestrian || addr.neighbourhood || ''

          const zip = addr.postcode || ''

          onChange({
            lat: latLng.lat,
            lng: latLng.lng,
            address: street,
            city,
            state,
            country,
            zip,
          })
        } else {
          // Fallback if address details not found
          onChange({
            lat: latLng.lat,
            lng: latLng.lng,
            address: '',
            city: '',
            state: '',
            country: '',
            zip: '',
          })
        }
      } catch (err) {
        console.error('Reverse geocoding error:', err)
        onChange({
          lat: latLng.lat,
          lng: latLng.lng,
          address: '',
          city: '',
          state: '',
          country: '',
          zip: '',
        })
      }
    }
  }

  // Move pin to the current center of the map view (from viewport panning)
  const handleMovePinToCenter = async (lat: number, lng: number) => {
    setMarkerPosition([lat, lng])
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await response.json()

      if (data && data.address) {
        const addr = data.address || {}
        const parts = data.display_name ? data.display_name.split(',').map((p: string) => p.trim()) : []
        const country = addr.country || (parts.length > 0 ? parts[parts.length - 1] : '')
        const state = addr.state || addr.region || (parts.length > 1 ? parts[parts.length - 2] : '')
        const city = addr.city || addr.town || addr.village || addr.county || (parts.length > 2 ? parts[parts.length - 3] : '')
        const street = addr.road || addr.suburb || addr.pedestrian || addr.neighbourhood || ''

        const zip = addr.postcode || ''

        onChange({
          lat,
          lng,
          address: street,
          city,
          state,
          country,
          zip,
        })
      } else {
        onChange({
          lat,
          lng,
          address: '',
          city: '',
          state: '',
          country: '',
          zip: '',
        })
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err)
      onChange({
        lat,
        lng,
        address: '',
        city: '',
        state: '',
        country: '',
        zip: '',
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search address (e.g. Sharm El Sheikh, Egypt)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-royal/30 focus:border-gold-royal transition-all text-sm shadow-inner"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="px-5 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Search</span>
        </button>
      </div>

      {geocodingError && (
        <p className="text-red-500 text-xs mt-1 font-medium">{geocodingError}</p>
      )}

      {/* Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200/80 shadow-md">
        <div className="h-[320px] md:h-[400px] w-full">
          {shouldRenderMap ? (
            <MapContainer
              center={position}
              zoom={12}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%', zIndex: 1 }}
            >
              {/* Google Maps Standard Roadmap Layer (Lightweight, free, and up-to-date) */}
              <TileLayer
                attribution="&copy; Google Maps"
                url="https://mt1.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}"
              />
              <MapViewController center={position} zoom={zoom} />
              <CenterOnPinButton position={markerPosition} />
              <MovePinToCenterButton onMove={handleMovePinToCenter} />
              <Marker
                position={markerPosition}
                draggable={true}
                eventHandlers={{
                  dragend: handleMarkerDragEnd,
                }}
                ref={markerRef}
                icon={customIcon}
              />
            </MapContainer>
          ) : (
            <div className="h-full w-full bg-slate-50 animate-pulse rounded-2xl flex items-center justify-center text-gray-400 font-bold border border-dashed border-gray-200">
              Initializing Location Engine...
            </div>
          )}
        </div>

        {/* Tip Badge overlay */}
        <div className="absolute bottom-4 left-4 z-999 bg-navy-deep/95 text-white px-3 py-1.5 rounded-lg border border-gold-royal/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-sm pointer-events-none shadow-md">
          <MapPin className="w-3.5 h-3.5 text-gold-royal animate-bounce" />
          <span>Drag pin to lock exact property coordinates</span>
        </div>
      </div>
    </div>
  )
}
