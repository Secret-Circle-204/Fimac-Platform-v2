'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { Globe, Map } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { MapResizer } from './map-resizer'

// Leaflet icon default fix
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

// Generate the Fimac Gold pin icon
const createFimacIcon = () => {
  if (typeof window === 'undefined') return null
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `
      <div class="relative flex items-center justify-center pointer-events-none" style="width: 52px; height: 52px; margin-top: -14px;">
        <!-- Outer Pulse Glow -->
        <div class="absolute inset-0 rounded-full animate-ping opacity-60 pointer-events-none" 
             style="background-color: var(--navy-deep, #153075); animation-duration: 2s;"></div>
        
        <!-- Luxury Pin Circle (Blue background, Gold border) -->
        <div class="relative w-12 h-12 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 pointer-events-auto cursor-pointer overflow-hidden" 
             style="background-color: var(--navy-deep, #153075); border: 2px solid var(--gold-royal, #a18052);">
          <img src="/fimac-icon-for-pin-map.svg" class="object-contain" style="width: 42px; height: 21px; transform: scale(2.5) translateY(6px); transform-origin: center;" alt="Fimac" />
        </div>
        
        <!-- Bottom Pointer Point (Blue background, Gold border) -->
        <div class="absolute -bottom-1.5 w-3.5 h-3.5 rotate-45 shadow-md pointer-events-none" 
             style="background-color: var(--navy-deep, #153075); border-right: 2px solid var(--gold-royal, #a18052); border-bottom: 2px solid var(--gold-royal, #a18052); margin-top: -4px;"></div>
      </div>
    `,
    iconSize: [52, 52],
    iconAnchor: [26, 52],
    popupAnchor: [0, -52],
  })
}

interface SmartMapProps {
  lat: number
  lng: number
  zoom: number
  title: string
  precision: 'exact' | 'city' | 'state'
}

type MapStyle = 'satellite' | 'street'

export function SmartMap({ lat, lng, zoom, title: _title, precision }: SmartMapProps) {
  const [mapStyle, setMapStyle] = useState<MapStyle>('satellite')
  const [googleTilesWorking, setGoogleTilesWorking] = useState(true)
  const [sensingCompleted, setSensingCompleted] = useState(false)
  const [shouldRenderMap, setShouldRenderMap] = useState(false)
  const [langCode, setLangCode] = useState('en')

  // Detect user's browser language on client mount
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.split('-')[0]
      setLangCode(browserLang || 'en')
    }
  }, [])

  // 1. Delay map mounting slightly to allow animations (e.g. framer-motion portal entry) to finish.
  // This prevents Leaflet from mounting on a detached/transforming DOM node which causes the 'appendChild' error.
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRenderMap(true)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  // 2. Smart Sensing: Check if Google Tile servers are reachable
  useEffect(() => {
    let isMounted = true

    // Pre-flight check to Google Tile servers to detect offline status or routing blocks
    fetch('https://mt1.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' })
      .then(() => {
        if (isMounted) {
          console.log('[SmartMap] Google Tile servers reachable.')
          setGoogleTilesWorking(true)
          setSensingCompleted(true)
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn(
            '[SmartMap] Google Tile servers blocked or unreachable. Falling back to Esri/CartoDB.',
            err,
          )
          setGoogleTilesWorking(false)
          setSensingCompleted(true)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // 3. Show dynamic premium loading state while sensing connection or waiting for portal animations
  if (!sensingCompleted || !shouldRenderMap) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-navy-deep/90 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold-royal border-t-transparent mx-auto mb-3" />
          <p className="text-white/60 text-xs font-medium uppercase tracking-widest">
            Initializing Premium Map...
          </p>
        </div>
      </div>
    )
  }

  // Get custom Fimac icon
  const customIcon = createFimacIcon()

  // Define strict boundaries (2.2 km radius / 0.02 degrees) around the listing for performance/bandwidth safety
  const bounds = [
    [lat - 0.02, lng - 0.02],
    [lat + 0.02, lng + 0.02],
  ] as [number, number][]

  // Safely bound the zoom range (expanded to 20)
  const mapZoom = Math.max(11, Math.min(zoom, 20))

  // Determine active tile layer configurations
  let tileUrl = ''
  let tileAttribution = ''

  if (mapStyle === 'satellite') {
    if (googleTilesWorking) {
      tileUrl = `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=${langCode}` // Google Hybrid (Satellite + labels)
      tileAttribution = 'Map data &copy; Google Maps'
    } else {
      tileUrl =
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' // Esri Satellite
      tileAttribution = '&copy; Esri &mdash; Sources: Esri, Maxar, Earthstar Geographics'
    }
  } else {
    // Street / Roadmap View
    if (googleTilesWorking) {
      tileUrl = `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=${langCode}` // Google Roadmap (Standard Map)
      tileAttribution = 'Map data &copy; Google Maps'
    } else {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' // CartoDB Positron (Clean Light Street Map fallback)
      tileAttribution =
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }
  }

  // Set native zoom limits to prevent missing tiles on zoom 19-20 (Google supports 20 natively, fallback Esri/CartoDB scales from 18)
  const maxNativeZoom = mapStyle === 'satellite' && !googleTilesWorking ? 18 : 20

  return (
    <div className="w-full h-full relative group/map overflow-hidden">
      {/* Dynamic Tile Layer Map */}
      <MapContainer
        center={[lat, lng]}
        zoom={mapZoom}
        minZoom={11}
        maxZoom={20}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution={tileAttribution}
          url={tileUrl}
          maxZoom={20}
          maxNativeZoom={maxNativeZoom}
        />
        {mapStyle === 'satellite' && !googleTilesWorking && (
          // Add transportation overlay for Esri fallback to keep names readable
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
            maxZoom={20}
            maxNativeZoom={18}
          />
        )}
        {customIcon && <Marker position={[lat, lng]} icon={customIcon} />}
        <MapResizer />
      </MapContainer>

      {/* Floating Style/Theme Switcher Controller */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setMapStyle(mapStyle === 'satellite' ? 'street' : 'satellite')}
          className="bg-navy-deep/80 backdrop-blur-md border border-gold-royal/30 hover:bg-gold-royal hover:text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all duration-300 shadow-lg flex items-center gap-2 hover:border-gold-royal/50 select-none cursor-pointer"
        >
          {mapStyle === 'satellite' ? (
            <>
              <Map className="w-3 h-3 text-white" />
              <span className="text-white">Map</span>
            </>
          ) : (
            <>
              <Globe className="w-3 h-3 text-gold-royal" />
              <span className="text-gold-royal">Satellite View</span>
            </>
          )}
        </button>
      </div>

      {/* Connection Indicator in bottom-left */}
      <div className="absolute bottom-3 left-3 z-10 bg-navy-deep/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 pointer-events-none select-none">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${googleTilesWorking ? 'bg-green-500' : 'bg-gold-royal animate-pulse'}`}
          />
          <p className="text-[9px] text-white/40 font-medium uppercase tracking-wider">
            {mapStyle === 'satellite'
              ? googleTilesWorking
                ? 'Google Satellite Active'
                : 'Satellite Fallback Active'
              : googleTilesWorking
                ? 'Google Maps Active'
                : 'Standard Map Fallback Active'}
          </p>
        </div>
      </div>

      {/* Approximate Location Notice */}
      {precision !== 'exact' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-navy-deep/85 backdrop-blur-xl px-4 py-2 rounded-full border border-gold-royal/30 pointer-events-none shadow-xl">
          <p className="text-[9px] text-gold-royal font-bold uppercase tracking-widest whitespace-nowrap">
            ⚠ Approximate {precision} location
          </p>
        </div>
      )}
    </div>
  )
}
