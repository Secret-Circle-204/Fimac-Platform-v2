'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { Property } from '@/payload-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Globe as GlobeIcon } from 'lucide-react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { GLOBE_TEXTURES } from './globe-textures'
import type * as THREE_TYPES from 'three'
import type { GlobeMethods } from 'react-globe.gl'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { buildPropertyUrl } from '@/repository/property/generate-url'
import { isValidCoordinate } from '@/lib/geo/is-valid-coordinate'
import { PropertyMapPortal } from './property-map-portal'
import { formatPrice } from '@/lib/format-price'

const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-400">Loading 3D Globe...</p>
    </div>
  ),
})

interface GlobeDataPoint {
  id: string | number
  lat: number
  lng: number
  realLat: number
  realLng: number
  title: string | null | undefined
  price: number | null | undefined
  currency: string | null | undefined
  status: string | null | undefined
  beds: number | null | undefined
  baths: number | null | undefined
  sqM: number | null | undefined
  type: string | null | undefined
  img: string | null | undefined
  city: string | null | undefined
  state: string | null | undefined
  isClustered: boolean
  clusterIndex: number
  clusterTotal: number
  url: string
}

interface AnimatedGlobeProps {
  properties: Property[]
  variant?: 'default' | 'minimal'
}

// Safely fly the globe camera — with try/catch, mounted-check, and coord validation
function safePointOfView(
  globeRef: React.RefObject<GlobeMethods | undefined>,
  coords: { lat: number; lng: number; altitude?: number },
  durationMs: number,
): boolean {
  try {
    if (!globeRef.current) return false
    if (!isValidCoordinate(coords.lat, coords.lng)) return false
    globeRef.current.pointOfView(
      { lat: coords.lat, lng: coords.lng, altitude: coords.altitude ?? 0.5 },
      durationMs,
    )
    return true
  } catch (err) {
    console.error('[Globe] pointOfView crashed:', err)
    return false
  }
}

export function AnimatedGlobe({ properties, variant = 'default' }: AnimatedGlobeProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParamsHook = useSearchParams()

  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  // State for responsive dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredProperty, setHoveredProperty] = useState<GlobeDataPoint | null>(null)

  // Portal State: When a user clicks a property, we open the detailed 2D map portal
  const [activePortalProperty, setActivePortalProperty] = useState<GlobeDataPoint | null>(null)

  // Optimization State: Track if the camera is currently in a "Fly-To" animation
  const [isFlying, setIsFlying] = useState(false)

  // Visibility States for Optimization: Stop CPU/GPU work when hidden
  const [isInView, setIsInView] = useState(true)
  const [isTabVisible, setIsTabVisible] = useState(true)

  // Map properties to globe coordinate data with deterministic offset for overlapping points
  const globeData = useMemo(() => {
    if (!properties || properties.length === 0) return []

    // Group properties by exact coordinates
    const coordsMap = new Map<string, Property[]>()

    properties.forEach((p) => {
      if (
        p.location &&
        typeof p.location === 'object' &&
        p.location.geo &&
        typeof p.location.geo.lat === 'number' &&
        typeof p.location.geo.lng === 'number'
      ) {
        const lat = p.location.geo.lat
        const lng = p.location.geo.lng
        const key = `${lat.toFixed(6)},${lng.toFixed(6)}`
        if (!coordsMap.has(key)) coordsMap.set(key, [])
        coordsMap.get(key)?.push(p)
      }
    })

    const data: GlobeDataPoint[] = []

    coordsMap.forEach((groupProps, key) => {
      const [baseLat, baseLng] = key.split(',').map(Number)
      const count = groupProps.length

      groupProps.forEach((p, index) => {
        let finalLat = baseLat
        let finalLng = baseLng

        // If multiple properties share the same spot, spread them in a small circle
        if (count > 1) {
          const angle = (index / count) * 2 * Math.PI
          // Small offset radius (approx 3km on globe for visibility)
          const radius = 0.03
          finalLat += radius * Math.cos(angle)
          finalLng += radius * Math.sin(angle)
        }

        data.push({
          id: p.id,
          lat: finalLat,
          lng: finalLng,
          realLat: baseLat,
          realLng: baseLng,
          title: p.title,
          price: p.price,
          currency: p.currency,
          status: p.listingStatus,
          beds: p.details?.bedrooms,
          baths: p.details?.bathrooms,
          sqM: p.details?.squareMeters,
          type:
            typeof p.propertyType === 'object' && p.propertyType !== null
              ? p.propertyType.name
              : undefined,
          img:
            p.photos?.[0] && typeof p.photos[0] === 'object' && 'url' in p.photos[0]
              ? p.photos[0].sizes?.thumbnail?.url || p.photos[0].url
              : '',
          city: p.location?.address?.city,
          state: p.location?.address?.state,
          isClustered: count > 1,
          clusterIndex: index + 1,
          clusterTotal: count,
          url:
            (p as unknown as { url?: string }).url ||
            buildPropertyUrl(p.id, p.location?.address || { street: p.street }),
        })
      })
    })

    return data as unknown as GlobeDataPoint[]
  }, [properties])

  // Track tab visibility
  useEffect(() => {
    if (typeof document === 'undefined') return
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === 'visible')
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Track container viewport intersection
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.05 } // 5% visibility is enough to count as visible
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          })
        }
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Initialize globe controls after it mounts
  useEffect(() => {
    if (globeRef.current) {
      // Set initial camera position slightly further back
      globeRef.current.pointOfView({ altitude: 2.5 }, 0)

      // Auto-rotate the globe slowly when not hovered AND not in portal/flight AND active/visible
      const controls = globeRef.current.controls()
      if (controls) {
        controls.autoRotate = !isHovered && !activePortalProperty && !isFlying && isInView && isTabVisible
        controls.autoRotateSpeed = 0.5
        controls.minDistance = 120 // Max zoom in (radius is 100)
        controls.maxDistance = 400 // Max zoom out
      }
    }
  }, [isHovered, dimensions, activePortalProperty, isFlying, isInView, isTabVisible])

  // Listen for hover/click events from the property cards list
  useEffect(() => {
    const handleCardClick = (e: Event) => {
      const customEvent = e as CustomEvent<{ lat: number; lng: number; id: string }>
      if (!customEvent.detail) return

      const { lat, lng, id } = customEvent.detail
      const prop = globeData.find((p) => p.id === id)

      // Attempt cinematic fly-to (safePointOfView handles all validation internally)
      const didFly = safePointOfView(globeRef, { lat, lng, altitude: 0.5 }, 1500)

      if (didFly) {
        setIsFlying(true)
        setTimeout(() => setIsFlying(false), 1600)
        // Open portal after flight completes
        if (prop) setTimeout(() => setActivePortalProperty(prop), 1600)
      } else {
        // Coords invalid — open portal immediately with fallback UI (no globe animation)
        console.warn(`[Globe] Skipped fly-to for property ${id}: invalid coords (${lat}, ${lng})`)
        if (prop) setActivePortalProperty(prop)
      }
    }

    window.addEventListener('card-property-click', handleCardClick)
    return () => window.removeEventListener('card-property-click', handleCardClick)
  }, [globeData])

  // State for "Search in this area"
  const [hasMoved, setHasMoved] = useState(false)

  // Listen for camera changes to show the "Search in this area" button
  const handleCameraChange = useCallback(() => {
    if (!hasMoved) setHasMoved(true)
  }, [hasMoved])

  const handleSearchInArea = () => {
    if (globeRef.current) {
      const { lat, lng, altitude } = globeRef.current.pointOfView()

      // Calculate radius based on altitude (rough approximation for the globe)
      // High altitude = larger radius
      const radius = Math.max(50, altitude * 500)

      const params = new URLSearchParams(searchParamsHook.toString())
      params.set('lat', lat.toFixed(4))
      params.set('lng', lng.toFixed(4))
      params.set('radius', radius.toFixed(0))
      // Clear text location when searching by coordinates
      params.delete('location')

      router.push(`${pathname}?${params.toString()}`, { scroll: false })
      setHasMoved(false)
    }
  }

  const globeContent = (
    <div
      className="w-full h-full cursor-grab active:cursor-grabbing relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={containerRef}
    >
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl={GLOBE_TEXTURES.earthDay}
          backgroundImageUrl={GLOBE_TEXTURES.starrySky}
          showGlobe={true}
          atmosphereColor="#a18052"
          atmosphereAltitude={isFlying || activePortalProperty ? 0 : 0.2}
          onZoom={handleCameraChange}
          onGlobeClick={handleCameraChange}
          onGlobeReady={async () => {
            if (globeRef.current && typeof globeRef.current.scene === 'function') {
              const scene = globeRef.current.scene()

              // Lazily import Three.js runtime value to keep it out of the initial chunk
              const THREE = await import('three')

              const ambientLight = new THREE.AmbientLight(0xffffff, 1.8)
              const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0)
              directionalLight.position.set(1, 1, 1)

              const lightsToRemove: THREE_TYPES.Object3D[] = []
              scene.traverse((child: THREE_TYPES.Object3D) => {
                if ((child as unknown as { isLight?: boolean }).isLight) lightsToRemove.push(child)
                const mesh = child as THREE_TYPES.Mesh
                if (
                  mesh.isMesh &&
                  mesh.material &&
                  (mesh.material as THREE_TYPES.MeshPhongMaterial).type === 'MeshPhongMaterial'
                ) {
                  ;(mesh.material as THREE_TYPES.MeshPhongMaterial).shininess = 0
                  ;(mesh.material as THREE_TYPES.MeshPhongMaterial).specular = new THREE.Color(
                    '#000000',
                  )
                }
              })

              lightsToRemove.forEach((l) => scene.remove(l))
              scene.add(ambientLight)
              scene.add(directionalLight)
            }
          }}
          htmlElementsData={globeData as object[]}
          htmlElement={(d: object) => {
            const globeDataPoint = d as GlobeDataPoint
            const el = document.createElement('div')
            const gold = '#a18052'

            el.innerHTML = `
                  <div style="
                    width: 20px; 
                    height: 20px; 
                    background: ${gold}; 
                    border-radius: 50%; 
                    box-shadow: 0 0 15px ${gold}, 0 0 30px ${gold};
                    border: 3px solid white;
                    cursor: pointer;
                    transform: translate(-50%, -50%);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                  " onmouseover="this.style.transform='translate(-50%, -50%) scale(1.5)'; this.style.boxShadow='0 0 40px ${gold}';" onmouseout="this.style.transform='translate(-50%, -50%) scale(1)'; this.style.boxShadow='0 0 15px ${gold}';">
                  </div>
                `
            el.style.pointerEvents = 'auto'

            el.onmouseenter = () => {
              setHoveredProperty(globeDataPoint)
              window.dispatchEvent(
                new CustomEvent('globe-property-hover', { detail: globeDataPoint.id }),
              )
            }

            el.onmouseleave = () => {
              setHoveredProperty(null)
              window.dispatchEvent(new CustomEvent('globe-property-hover', { detail: null }))
            }

            el.onclick = () => {
              const didFly = safePointOfView(
                globeRef,
                { lat: globeDataPoint.lat, lng: globeDataPoint.lng, altitude: 0.4 },
                1500,
              )

              if (didFly) {
                setIsFlying(true)
                setTimeout(() => {
                  setActivePortalProperty(globeDataPoint)
                  setIsFlying(false)
                }, 1600)
              } else {
                // Invalid coords — open portal immediately with fallback
                setActivePortalProperty(globeDataPoint)
              }
              window.dispatchEvent(
                new CustomEvent('globe-property-click', { detail: globeDataPoint.id }),
              )
            }
            return el
          }}
        />
      )}

      {/* Search In Area Button */}
      <AnimatePresence>
        {hasMoved && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-20 shadow-2xl"
          >
            <Button
              onClick={handleSearchInArea}
              className="bg-gold-royal hover:bg-white hover:text-navy-deep text-white px-8 py-6 rounded-2xl font-bold uppercase tracking-widest shadow-gold transition-all duration-500 flex items-center gap-3 border border-white/20"
            >
              <GlobeIcon className="h-5 w-5 animate-pulse" />
              Search In This Area
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Luxury Portal Overlay */}
      <PropertyMapPortal
        property={activePortalProperty}
        onClose={() => setActivePortalProperty(null)}
      />

      {/* Gold Hover Tooltip */}
      {hoveredProperty && !activePortalProperty && (
        <div className="absolute bottom-10 left-10 transform bg-navy-deep/90 backdrop-blur-xl p-5 rounded-3xl shadow-gold z-20 w-80 pointer-events-none border border-gold-royal/20 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex gap-5 items-center">
            {hoveredProperty.img && (
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-gold-royal/20">
                <Image
                  src={hoveredProperty.img || '/placeholder.jpg'}
                  alt={hoveredProperty.title || 'Property image'}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight">
                {hoveredProperty.title}
              </h4>
              <p className="text-gold-royal font-bold text-lg mt-1 italic">
                {hoveredProperty.price
                  ? formatPrice(hoveredProperty.price, hoveredProperty.currency)
                  : 'Price upon request'}
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-royal animate-pulse" />
                  <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">
                    {hoveredProperty.isClustered
                      ? `Estate ${hoveredProperty.clusterIndex}/${hoveredProperty.clusterTotal}`
                      : 'Market Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  if (variant === 'minimal') {
    return globeContent
  }

  return (
    <Card className="h-full sticky top-24 overflow-hidden border border-navy-deep/10 shadow-navy bg-navy-deep rounded-3xl">
      <CardHeader className="absolute top-0 w-full z-10 bg-linear-to-b from-navy-deep/90 to-transparent border-0 p-8">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="p-2 bg-gold-royal/20 rounded-xl border border-gold-royal/30">
            <GlobeIcon className="h-5 w-5 text-gold-royal" />
          </div>
          <span className="font-bold uppercase tracking-widest text-lg">Global Vision</span>
        </CardTitle>
        <p className="text-[10px] uppercase font-bold tracking-widest text-gold-royal/60 mt-2">
          {globeData.length} Signature Estates Tracked
        </p>
      </CardHeader>

      <CardContent className="p-0 h-[calc(100vh-8rem)] relative">{globeContent}</CardContent>
    </Card>
  )
}
