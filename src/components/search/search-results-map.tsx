'use client'

/**
 * ═══════════════════════════════════════════════════════════════════
 *  FIMAC Globe — Cinematic 3D Property Globe (Enterprise AAA)
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Renders properties on a 3D WebGL globe with:
 *  - O(log N) spatial clustering via supercluster
 *  - FSM-driven spiderfy expansion with rAF sync
 *  - Object Pool DOM recycling (zero GC pressure)
 *  - LOD rendering (WebGL points → HTML elements)
 *  - Strict separation of concerns (5 specialized controllers)
 *
 *  External API unchanged: <AnimatedGlobe properties={[...]} />
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { Property } from '@/payload-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe as GlobeIcon } from 'lucide-react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { GLOBE_TEXTURES } from './globe-textures'
import * as THREE from 'three'
import type { GlobeMethods } from 'react-globe.gl'
import { isValidCoordinate } from '@/lib/geo/is-valid-coordinate'
import { PropertyMapPortal } from './property-map-portal'
import { formatPrice } from '@/lib/format-price'
import { buildPropertyUrl } from '@/repository/property/generate-url'

// Clustering engine
import {
  ClusterController,
  GOLD_ROYAL,
  GOLD_LIGHT,
  type ClusterPoint,
  type GlobePropertyData,
} from './globe-cluster'

const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-royal mb-4" />
      <p className="text-gray-400">Loading 3D Globe...</p>
    </div>
  ),
})

const FALLBACK_IMAGE_DATA_URI = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

// ─── Backward-compatible type (used by PropertyMapPortal) ───────

/**
 * @deprecated Use GlobePropertyData from globe-cluster module instead.
 * Kept for backward compatibility with PropertyMapPortal.
 */
export interface GlobeDataPoint {
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

// ─── Helpers ────────────────────────────────────────────────────

/** Converts GlobePropertyData to the legacy GlobeDataPoint for portal compat */
function toPortalProperty(data: GlobePropertyData): GlobeDataPoint {
  return {
    id: data.id,
    lat: data.lat,
    lng: data.lng,
    realLat: data.lat,
    realLng: data.lng,
    title: data.title,
    price: data.price,
    currency: data.currency,
    status: data.status,
    beds: data.beds,
    baths: data.baths,
    sqM: data.sqM,
    type: data.type,
    img: data.img,
    city: data.city,
    state: data.state,
    isClustered: false,
    clusterIndex: 1,
    clusterTotal: 1,
    url: data.url,
  }
}

/** Safely fly the globe camera — with try/catch, mounted-check, and coord validation */
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

// ─── Main Component ─────────────────────────────────────────────

export function AnimatedGlobe({ properties, variant = 'default' }: AnimatedGlobeProps) {

  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<ClusterController | null>(null)

  // DOM element cache: prevents re-creation on every data update
  const elementCacheRef = useRef(new Map<string | number, HTMLDivElement>())

  // State
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredProperty, setHoveredProperty] = useState<GlobePropertyData | null>(null)
  const [activePortalProperty, setActivePortalProperty] = useState<GlobeDataPoint | null>(null)
  const [isFlying, setIsFlying] = useState(false)
  const [isInView, setIsInView] = useState(true)
  const [isTabVisible, setIsTabVisible] = useState(true)

  // Visible clusters from the spatial index (drives globe rendering)
  const [visibleClusters, setVisibleClusters] = useState<ClusterPoint[]>([])
  const [indexedCount, setIndexedCount] = useState(0)

  // State to track the expanded cluster ID to filter it out from rendering
  const [expandedClusterId, setExpandedClusterId] = useState<string | number | null>(null)

  // ─── Controller Initialization ──────────────────────────────────

  // Initialize the ClusterController when container is available
  useEffect(() => {
    if (!containerRef.current) return

    const getScreenCoords = (lat: number, lng: number, altitude?: number) => {
      if (!globeRef.current) return undefined
      try {
        const coords = globeRef.current.getScreenCoords(lat, lng, altitude)
        if (coords && typeof coords.x === 'number' && typeof coords.y === 'number') {
          return coords
        }
        return undefined
      } catch {
        return undefined
      }
    }

    const controller = new ClusterController(
      containerRef.current,
      getScreenCoords,
      {
        onPropertySelect: (property: GlobePropertyData) => {
          setActivePortalProperty(toPortalProperty(property))
          // Automatically close spiderfy pins when a property is selected
          controllerRef.current?.requestClose()
        },
        onPropertyHover: (property: GlobePropertyData | null) => {
          setHoveredProperty(property)
          window.dispatchEvent(
            new CustomEvent('globe-property-hover', {
              detail: property ? property.id : null,
            }),
          )
        },
        onClusterExpand: (clusterId: string | number | null) => {
          setExpandedClusterId(clusterId)
        },
      },
    )

    controllerRef.current = controller

    // Properties are loaded by the next useEffect hook

    return () => {
      controller.dispose()
      controllerRef.current = null
    }
  }, [])

  // Wire up globe ref to controller when globe mounts
  useEffect(() => {
    if (controllerRef.current && globeRef.current) {
      controllerRef.current.setGlobeRef(globeRef as React.RefObject<GlobeMethods | undefined>)
    }
  })

  // ─── Load Properties into Spatial Index ────────────────────────

  useEffect(() => {
    if (controllerRef.current && properties && properties.length > 0) {
      const count = controllerRef.current.loadProperties(properties)
      setIndexedCount(count)

      const pov = globeRef.current?.pointOfView()
      const clusters = controllerRef.current.updateVisibleClusters(
        pov?.lat ?? 0,
        pov?.lng ?? 0,
        pov?.altitude ?? 2.5,
      )
      setVisibleClusters(clusters)
    }
  }, [properties])

  // ─── Viewport Tracking & Optimization ─────────────────────────

  // Track tab visibility
  useEffect(() => {
    if (typeof document === 'undefined') return
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === 'visible')
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Track container viewport intersection
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.05 },
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Track container dimensions
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

  // ─── Globe Controls ───────────────────────────────────────────

  useEffect(() => {
    if (!globeRef.current) return
    const controls = globeRef.current.controls()
    if (controls) {
      controls.autoRotate =
        !isHovered && !activePortalProperty && !isFlying && isInView && isTabVisible
      controls.autoRotateSpeed = 0.5
      controls.minDistance = 120
      controls.maxDistance = 400
    }

    // Cleanup extra lights
    if (typeof globeRef.current.scene === 'function') {
      const scene = globeRef.current.scene()
      let lightCount = 0
      const extraLights: THREE.Object3D[] = []
      scene.traverse((child: THREE.Object3D) => {
        if ((child as unknown as { isLight?: boolean }).isLight) {
          lightCount++
          if (lightCount > 2) extraLights.push(child)
        }
      })
      extraLights.forEach((l) => scene.remove(l))
    }
  }, [isHovered, dimensions, activePortalProperty, isFlying, isInView, isTabVisible])

  // Auto zoom out when mouse leaves
  useEffect(() => {
    if (!isHovered && !activePortalProperty && !isFlying && globeRef.current) {
      const current = globeRef.current.pointOfView()
      if (current && current.altitude < 2.5) {
        globeRef.current.pointOfView({ lat: current.lat, lng: current.lng, altitude: 2.5 }, 1500)
      }
    }
  }, [isHovered, activePortalProperty, isFlying])

  // ─── Camera Change Handler (Updates Spatial Index) ─────────────

  const handleCameraChange = useCallback(() => {
    // Update visible clusters from spatial index
    if (controllerRef.current && globeRef.current) {
      const pov = globeRef.current.pointOfView()
      if (pov) {
        // Dynamic zoom-based card spreading via CSS variable
        const container = containerRef.current
        if (container) {
          container.style.setProperty('--globe-zoom-altitude', String(pov.altitude))
        }

        const clusters = controllerRef.current.updateVisibleClusters(
          pov.lat,
          pov.lng,
          pov.altitude,
        )
        setVisibleClusters((prev) => {
          if (prev.length !== clusters.length) {
            return clusters
          }
          const isSame = prev.every((item, idx) => {
            const newItem = clusters[idx]
            return (
              item.id === newItem.id &&
              item.pointCount === newItem.pointCount &&
              item.lat === newItem.lat &&
              item.lng === newItem.lng
            )
          })
          return isSame ? prev : clusters
        })
      }
    }
  }, [])

  // ─── External Event Listeners ─────────────────────────────────

  // Listen for card clicks from the property list
  useEffect(() => {
    const handleCardClick = (e: Event) => {
      const customEvent = e as CustomEvent<{ lat: number; lng: number; id: string }>
      if (!customEvent.detail) return

      const { lat, lng, id } = customEvent.detail

      // Close spiderfy when card is clicked
      controllerRef.current?.requestClose()

      // Find the property in the complete properties array
      const foundProp = properties.find((p) => String(p.id) === String(id))

      // Attempt cinematic fly-to
      const didFly = safePointOfView(globeRef, { lat, lng, altitude: 0.5 }, 1500)

      if (didFly) {
        setIsFlying(true)
        setTimeout(() => setIsFlying(false), 1600)
        // Open portal after flight
        if (foundProp) {
          const address = typeof foundProp.location === 'object' ? foundProp.location?.address : null
          const geo = typeof foundProp.location === 'object' ? foundProp.location?.geo : null
          
          const propertyUrl =
            (foundProp as unknown as { url?: string }).url ||
            buildPropertyUrl(foundProp.id, address || { street: foundProp.street })

          const portalProp: GlobePropertyData = {
            id: foundProp.id,
            lat: geo?.lat ?? lat,
            lng: geo?.lng ?? lng,
            title: foundProp.title,
            price: foundProp.price,
            currency: foundProp.currency,
            status: typeof foundProp.listingStatus === 'object' && foundProp.listingStatus ? foundProp.listingStatus.slug : (typeof foundProp.listingStatus === 'string' ? foundProp.listingStatus : undefined),
            beds: foundProp.details?.bedrooms,
            baths: foundProp.details?.bathrooms,
            sqM: foundProp.details?.squareMeters,
            type: typeof foundProp.propertyType === 'object' && foundProp.propertyType !== null ? foundProp.propertyType.name : undefined,
            img: foundProp.photos?.[0] && typeof foundProp.photos[0] === 'object' && 'url' in foundProp.photos[0]
              ? foundProp.photos[0].sizes?.thumbnail?.url || foundProp.photos[0].url
              : undefined,
            city: address?.city,
            state: address?.state,
            url: propertyUrl,
          }

          setTimeout(
            () => setActivePortalProperty(toPortalProperty(portalProp)),
            1600,
          )
        }
      } else {
        console.warn(`[Globe] Skipped fly-to for property ${id}: invalid coords (${lat}, ${lng})`)
        if (foundProp) {
          const address = typeof foundProp.location === 'object' ? foundProp.location?.address : null
          const geo = typeof foundProp.location === 'object' ? foundProp.location?.geo : null
          
          const propertyUrl =
            (foundProp as unknown as { url?: string }).url ||
            buildPropertyUrl(foundProp.id, address || { street: foundProp.street })

          const portalProp: GlobePropertyData = {
            id: foundProp.id,
            lat: geo?.lat ?? lat,
            lng: geo?.lng ?? lng,
            title: foundProp.title,
            price: foundProp.price,
            currency: foundProp.currency,
            status: typeof foundProp.listingStatus === 'object' && foundProp.listingStatus ? foundProp.listingStatus.slug : (typeof foundProp.listingStatus === 'string' ? foundProp.listingStatus : undefined),
            beds: foundProp.details?.bedrooms,
            baths: foundProp.details?.bathrooms,
            sqM: foundProp.details?.squareMeters,
            type: typeof foundProp.propertyType === 'object' && foundProp.propertyType !== null ? foundProp.propertyType.name : undefined,
            img: foundProp.photos?.[0] && typeof foundProp.photos[0] === 'object' && 'url' in foundProp.photos[0]
              ? foundProp.photos[0].sizes?.thumbnail?.url || foundProp.photos[0].url
              : undefined,
            city: address?.city,
            state: address?.state,
            url: propertyUrl,
          }
          setActivePortalProperty(toPortalProperty(portalProp))
        }
      }
    }

    window.addEventListener('card-property-click', handleCardClick)
    return () => window.removeEventListener('card-property-click', handleCardClick)
  }, [properties])

  // ─── Globe Initialization ─────────────────────────────────────

  const handleGlobeReady = useCallback(() => {
    if (globeRef.current && typeof globeRef.current.scene === 'function') {
      const scene = globeRef.current.scene()

      // Prevent multiple initializations
      if (scene.userData.isReady) return
      scene.userData.isReady = true

      const ambientLight = new THREE.AmbientLight(0xffffff, 1.8)
      const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0)
      directionalLight.position.set(1, 1, 1)

      const lightsToRemove: THREE.Object3D[] = []
      scene.traverse((child: THREE.Object3D) => {
        if ((child as unknown as { isLight?: boolean }).isLight) lightsToRemove.push(child)
        const mesh = child as THREE.Mesh
        if (
          mesh.isMesh &&
          mesh.material &&
          (mesh.material as THREE.MeshPhongMaterial).type === 'MeshPhongMaterial'
        ) {
          ;(mesh.material as THREE.MeshPhongMaterial).shininess = 0
          ;(mesh.material as THREE.MeshPhongMaterial).specular = new THREE.Color('#000000')
        }
      })

      lightsToRemove.forEach((l) => scene.remove(l))
      scene.add(ambientLight)
      scene.add(directionalLight)

      globeRef.current.pointOfView({ altitude: 2.5 }, 0)

      // Wire controller to globe
      if (controllerRef.current) {
        controllerRef.current.setGlobeRef(globeRef as React.RefObject<GlobeMethods | undefined>)
      }

      // Limit camera distance to prevent excessive zooming and pixelation
      if (typeof globeRef.current.controls === 'function') {
        const controls = globeRef.current.controls()
        if (controls) {
          controls.minDistance = 145 // Limit zoom-in (equivalent to camera altitude 0.45)
          controls.maxDistance = 400 // Limit zoom-out (equivalent to camera altitude 3.0)
        }
      }
    }
  }, [])

  // ─── HTML Element Renderer (with DOM Cache) ───────────────────

  const renderHtmlElement = useCallback(
    (d: object) => {
      const point = d as ClusterPoint
      const key = point.id

      // Check DOM cache first — avoid re-creation
      const cached = elementCacheRef.current.get(key)
      if (cached) {
        updateClusterElement(cached, point)
        return cached
      }

      // Create new element
      const el = createClusterElement(point)
      elementCacheRef.current.set(key, el)

      // Attach event handlers
      el.onmouseenter = () => {
        if (controllerRef.current) {
          controllerRef.current.handlePointHover(point)
        }
      }
      el.onmouseleave = () => {
        if (controllerRef.current) {
          controllerRef.current.handlePointHover(null)
        }
      }
      el.onclick = () => {
        if (controllerRef.current) {
          controllerRef.current.handlePointClick(point)
        } else {
          // Fallback: open portal directly
          setActivePortalProperty(toPortalProperty(point.representative))
        }

        window.dispatchEvent(
          new CustomEvent('globe-property-click', { detail: point.representative.id }),
        )
      }

      return el
    },
    [],
  )

  // Clean stale DOM cache entries when clusters change
  useEffect(() => {
    const currentIds = new Set(visibleClusters.map((c) => c.id))
    for (const key of elementCacheRef.current.keys()) {
      if (!currentIds.has(key)) {
        elementCacheRef.current.delete(key)
      }
    }
  }, [visibleClusters])

  // ─── Render ───────────────────────────────────────────────────

  const globeContent = (
    <div
      className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={containerRef}
      style={{ '--globe-zoom-altitude': '2.5' } as React.CSSProperties}
    >
      {dimensions.width > 0 && isInView && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl={GLOBE_TEXTURES.earthDay}
          backgroundImageUrl={GLOBE_TEXTURES.starrySky}
          showGlobe={true}
          atmosphereColor={GOLD_ROYAL}
          atmosphereAltitude={isFlying || activePortalProperty ? 0 : 0.2}
          onZoom={handleCameraChange}
          onGlobeClick={() => {
            handleCameraChange()
            // Close spiderfy on globe background click
            if (controllerRef.current) {
              controllerRef.current.requestClose()
            }
          }}
          onGlobeReady={handleGlobeReady}
          htmlElementsData={
            (expandedClusterId
              ? visibleClusters.filter((c) => c.id !== expandedClusterId)
              : visibleClusters) as unknown as object[]
          }
          htmlElement={renderHtmlElement}
        />
      )}



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
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-royal animate-pulse" />
                <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">
                  Market Active
                </span>
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
          {visibleClusters.length} Clusters • {indexedCount} Properties Indexed
        </p>
      </CardHeader>

      <CardContent className="p-0 h-[calc(100vh-8rem)] relative">{globeContent}</CardContent>
    </Card>
  )
}

// ─── DOM Element Factory (Pure Functions) ───────────────────────

/**
 * Creates a DOM element for a cluster/point marker on the globe.
 * This is called by react-globe.gl's htmlElement accessor.
 */
function createClusterElement(point: ClusterPoint): HTMLDivElement {
  const el = document.createElement('div')
  const isCluster = point.isCluster && point.pointCount > 1
  const size = isCluster ? 48 : 34
  const wrapperSize = size * 1.5

  el.style.width = `${wrapperSize}px`
  el.style.height = `${wrapperSize}px`
  el.style.marginLeft = `${-wrapperSize / 2}px`
  el.style.marginTop = `${-wrapperSize / 2}px`
  el.style.cursor = 'pointer'
  el.style.pointerEvents = 'auto'
  el.style.display = 'flex'
  el.style.alignItems = 'center'
  el.style.justifyContent = 'center'

  // Prevent page scroll and forward wheel events directly to the canvas so the globe zooms
  el.addEventListener('wheel', (e) => {
    e.preventDefault()

    let parent = el.parentElement
    let canvas: HTMLCanvasElement | null = null
    while (parent && parent !== document.body) {
      canvas = parent.querySelector('canvas')
      if (canvas) break
      parent = parent.parentElement
    }

    if (canvas) {
      canvas.dispatchEvent(new WheelEvent('wheel', {
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        deltaZ: e.deltaZ,
        deltaMode: e.deltaMode,
        clientX: e.clientX,
        clientY: e.clientY,
        screenX: e.screenX,
        screenY: e.screenY,
        bubbles: true,
        cancelable: true
      }))
    }
  }, { passive: false })

  const signature = isCluster
    ? `cluster:${point.pointCount}:${(point.clusterImages || []).join(',')}`
    : `point:${point.representative.img || ''}`
  el.dataset.signature = signature

  if (isCluster) {
    const imgs = point.clusterImages || []
    const frontImg = imgs[0] || FALLBACK_IMAGE_DATA_URI
    const midImg = imgs[1] || frontImg
    const backImg = imgs[2] || frontImg
    const cleanId = String(point.id).replace(/[^a-zA-Z0-9]/g, '')

    el.innerHTML = `
      <style>
        .cluster-container-${cleanId} {
          position: relative;
          width: ${size}px;
          height: ${size}px;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          will-change: transform;
          --zoom-t: clamp(0, calc((2.5 - var(--globe-zoom-altitude, 2.5)) / 2.2), 1);
          --card-offset: calc(6px + var(--zoom-t) * 22px);
          --card-rotation: calc(10deg + var(--zoom-t) * 15deg);
        }
        .cluster-container-${cleanId}:hover {
          transform: scale(1.2);
        }
        .cluster-img-back-${cleanId} {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          background-image: url('${backImg}');
          background-size: cover;
          background-position: center;
          transform: translate(calc(-1 * var(--card-offset)), calc(-0.4 * var(--card-offset))) rotate(calc(-1 * var(--card-rotation))) scale(0.9);
          opacity: 0.85;
          z-index: 1;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .cluster-container-${cleanId}:hover .cluster-img-back-${cleanId} {
          transform: translate(calc(-1.8 * var(--card-offset)), calc(-0.8 * var(--card-offset))) rotate(calc(-1.5 * var(--card-rotation))) scale(0.9);
        }
        .cluster-img-mid-${cleanId} {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.35);
          background-image: url('${midImg}');
          background-size: cover;
          background-position: center;
          transform: translate(var(--card-offset), calc(-0.2 * var(--card-offset))) rotate(var(--card-rotation)) scale(0.95);
          opacity: 0.95;
          z-index: 2;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .cluster-container-${cleanId}:hover .cluster-img-mid-${cleanId} {
          transform: translate(calc(1.8 * var(--card-offset)), calc(-0.4 * var(--card-offset))) rotate(calc(1.5 * var(--card-rotation))) scale(0.95);
        }
        .cluster-img-front-${cleanId} {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2.5px solid white;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
          background-image: url('${frontImg}');
          background-size: cover;
          background-position: center;
          transform: rotate(0deg);
          z-index: 3;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .cluster-container-${cleanId}:hover .cluster-img-front-${cleanId} {
          transform: scale(1.05);
        }
      </style>
      <div class="cluster-container-${cleanId}">
        <!-- Back Image -->
        <div class="cluster-img-back-${cleanId}"></div>
        
        <!-- Middle Image -->
        <div class="cluster-img-mid-${cleanId}"></div>

        <!-- Front Image -->
        <div class="cluster-img-front-${cleanId}"></div>

        <!-- Count Badge -->
        <div style="
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${GOLD_ROYAL} 0%, ${GOLD_LIGHT} 100%);
          border: 2px solid white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 9px;
          font-family: sans-serif;
          z-index: 4;
        ">
          ${point.pointCount}
        </div>
      </div>
    `
  } else {
    const img = point.representative.img || FALLBACK_IMAGE_DATA_URI
    el.innerHTML = `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        will-change: transform;
      "
      onmouseover="this.style.transform='scale(1.3)';" 
      onmouseout="this.style.transform='scale(1)';"
      >
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2.5px solid ${GOLD_ROYAL};
          box-shadow: 0 4px 10px rgba(161, 128, 82, 0.4), 0 2px 6px rgba(0,0,0,0.3);
          background-image: url('${img}');
          background-size: cover;
          background-position: center;
          outline: 1.5px solid white;
        "></div>
      </div>
    `
  }

  return el
}

/**
 * Updates an existing cluster element's content without re-creating the DOM node.
 * Called when supercluster recalculates clusters (e.g., on zoom).
 */
function updateClusterElement(el: HTMLDivElement, point: ClusterPoint): void {
  const isCluster = point.isCluster && point.pointCount > 1
  const signature = isCluster
    ? `cluster:${point.pointCount}:${(point.clusterImages || []).join(',')}`
    : `point:${point.representative.img || ''}`

  if (el.dataset.signature === signature) {
    return
  }

  const size = isCluster ? 48 : 34
  const wrapperSize = size * 1.5

  el.style.width = `${wrapperSize}px`
  el.style.height = `${wrapperSize}px`
  el.style.marginLeft = `${-wrapperSize / 2}px`
  el.style.marginTop = `${-wrapperSize / 2}px`

  // Overwrite innerHTML to ensure image stack and count badge are updated
  if (isCluster) {
    const imgs = point.clusterImages || []
    const frontImg = imgs[0] || FALLBACK_IMAGE_DATA_URI
    const midImg = imgs[1] || frontImg
    const backImg = imgs[2] || frontImg

    el.innerHTML = `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        will-change: transform;
      "
      onmouseover="this.style.transform='scale(1.3)';" 
      onmouseout="this.style.transform='scale(1)';"
      >
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          background-image: url('${backImg}');
          background-size: cover;
          background-position: center;
          transform: translate(-6px, -4px) rotate(-15deg) scale(0.9);
          opacity: 0.8;
          z-index: 1;
        "></div>
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.35);
          background-image: url('${midImg}');
          background-size: cover;
          background-position: center;
          transform: translate(6px, -2px) rotate(15deg) scale(0.95);
          opacity: 0.9;
          z-index: 2;
        "></div>
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2.5px solid white;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
          background-image: url('${frontImg}');
          background-size: cover;
          background-position: center;
          transform: rotate(0deg);
          z-index: 3;
        "></div>
        <div style="
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${GOLD_ROYAL} 0%, ${GOLD_LIGHT} 100%);
          border: 2px solid white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 9px;
          font-family: sans-serif;
          z-index: 4;
        ">
          ${point.pointCount}
        </div>
      </div>
    `
  } else {
    const img = point.representative.img || FALLBACK_IMAGE_DATA_URI
    el.innerHTML = `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        will-change: transform;
      "
      onmouseover="this.style.transform='scale(1.3)';" 
      onmouseout="this.style.transform='scale(1)';"
      >
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2.5px solid ${GOLD_ROYAL};
          box-shadow: 0 4px 10px rgba(161, 128, 82, 0.4), 0 2px 6px rgba(0,0,0,0.3);
          background-image: url('${img}');
          background-size: cover;
          background-position: center;
          outline: 1.5px solid white;
        "></div>
      </div>
    `
  }

  el.dataset.signature = signature
}
