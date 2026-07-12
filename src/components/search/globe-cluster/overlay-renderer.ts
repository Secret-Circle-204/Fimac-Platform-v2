/**
 * ═══════════════════════════════════════════════════════════════════
 *  FIMAC Globe Clustering Engine — Overlay Renderer (rAF Sync)
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Manages the spiderfy overlay div that sits on top of the globe canvas.
 *  Uses requestAnimationFrame to continuously project 3D coordinates
 *  to 2D screen position — keeps pins anchored during globe rotation.
 *
 *  Performance budget: < 2ms per rAF frame at 60/120 FPS.
 */

import type { GlobePropertyData, SpiderfyPin, ClusterPoint } from './types'
import type { LayoutOffset } from './layout-cache'
import type { PoolManager } from './pool-manager'
import type { LayoutCache } from './layout-cache'
import { CLUSTER_CONFIG, GOLD_ROYAL } from './config'

/** Function signature for globe 3D → 2D screen projection */
export type ScreenProjection = (
  lat: number,
  lng: number,
  altitude?: number,
) => { x: number; y: number } | undefined

/**
 * OverlayRenderer manages the single spiderfy overlay div and its pin lifecycle.
 *
 * Responsibilities:
 * - Creates/owns the overlay container div
 * - Borrows pin nodes from PoolManager
 * - Positions pins using LayoutCache offsets
 * - Runs rAF loop for 3D→2D projection during globe rotation
 * - Cleans up and returns nodes on close
 */
export class OverlayRenderer {
  private readonly overlay: HTMLDivElement
  private rafId: number | null = null
  private activePins: SpiderfyPin[] = []
  private trackingLat = 0
  private trackingLng = 0
  private isVisible = false

  /** Line elements connecting pins to center */
  private lineCanvas: HTMLCanvasElement | null = null

  constructor(
    private readonly container: HTMLElement,
    private readonly poolManager: PoolManager,
    private readonly layoutCache: LayoutCache,
    private readonly getScreenCoords: ScreenProjection,
  ) {
    // Create the overlay container — positioned absolutely over the globe
    this.overlay = document.createElement('div')
    this.overlay.id = 'cluster-overlay'
    this.overlay.style.cssText = [
      'position: absolute',
      'top: 0',
      'left: 0',
      'width: 0',
      'height: 0',
      'pointer-events: none',
      'z-index: 15',
      'will-change: transform',
    ].join('; ')

    this.container.style.position = 'relative'
    this.container.appendChild(this.overlay)
  }

  /**
   * Opens the spiderfy expansion for a cluster.
   *
   * @param cluster - The cluster point to expand
   * @param properties - Individual properties to show as pins
   * @param onPinClick - Callback when a pin is clicked
   * @param onPinHover - Callback when a pin is hovered
   */
  open(
    cluster: ClusterPoint,
    properties: GlobePropertyData[],
    onPinClick: (property: GlobePropertyData) => void,
    onPinHover: (property: GlobePropertyData | null) => void,
  ): void {
    this.close() // Clean up any previous expansion

    const pinCount = Math.min(properties.length, CLUSTER_CONFIG.maxClusterExpansion)
    const layout = this.layoutCache.getLayout(pinCount)

    this.trackingLat = cluster.lat
    this.trackingLng = cluster.lng
    this.activePins = []

    // Create the center anchor dot
    this.createCenterDot()

    for (let i = 0; i < pinCount; i++) {
      const property = properties[i]
      const offset = layout[i]
      const node = this.poolManager.borrow()
      if (!node) break

      // Configure the pin node with property data
      this.configurePinNode(node, property, offset, onPinClick, onPinHover)

      this.activePins.push({
        property,
        offsetX: offset.x,
        offsetY: offset.y,
        node,
      })

      this.overlay.appendChild(node)
    }

    this.isVisible = true
    this.overlay.style.pointerEvents = 'auto'

    // Start tracking the globe's rotation
    this.startTracking()

    // Staggered pin entrance animation
    requestAnimationFrame(() => {
      for (let i = 0; i < this.activePins.length; i++) {
        const pin = this.activePins[i]
        const delay = i * 50 // 50ms stagger between pins
        setTimeout(() => {
          pin.node.style.opacity = '1'
          pin.node.style.pointerEvents = 'auto'
          pin.node.style.transform = `translate(calc(${pin.offsetX}px - 50%), calc(${pin.offsetY}px - 50%)) scale(1)`
        }, delay)
      }
    })
  }

  /**
   * Closes the spiderfy expansion with animation.
   * Returns all borrowed nodes to the pool after animation completes.
   *
   * @param onComplete - Optional callback when closing animation is done
   */
  close(onComplete?: () => void): void {
    if (!this.isVisible && this.activePins.length === 0) {
      if (onComplete) onComplete()
      return
    }

    this.stopTracking()

    // Reverse animation: collapse pins back to center
    for (const pin of this.activePins) {
      pin.node.style.opacity = '0'
      pin.node.style.pointerEvents = 'none'
      pin.node.style.transform = 'translate(-50%, -50%) scale(0)'
    }

    // Return nodes to pool after animation completes
    const pinsToReturn = [...this.activePins]
    setTimeout(() => {
      for (const pin of pinsToReturn) {
        if (pin.node.parentNode) {
          pin.node.parentNode.removeChild(pin.node)
        }
        this.poolManager.return(pin.node)
      }
      if (onComplete) onComplete()
    }, CLUSTER_CONFIG.animationDurationMs)

    this.activePins = []
    this.isVisible = false
    this.overlay.style.pointerEvents = 'none'

    // Remove center dot and lines
    this.removeCenterDot()
  }

  /** Whether the spiderfy overlay is currently visible */
  get visible(): boolean {
    return this.isVisible
  }

  /** Number of active pins */
  get pinCount(): number {
    return this.activePins.length
  }

  /**
   * Disposes all resources.
   * Call on component unmount.
   */
  dispose(): void {
    this.close()
    this.stopTracking()

    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay)
    }
  }

  // ─── Private: rAF Tracking Loop ────────────────────────────────

  private startTracking(): void {
    this.stopTracking()

    const track = (): void => {
      const coords = this.getScreenCoords(this.trackingLat, this.trackingLng, 0.01)
      if (coords) {
        this.overlay.style.transform = `translate(${coords.x}px, ${coords.y}px)`
      }
      this.rafId = requestAnimationFrame(track)
    }

    this.rafId = requestAnimationFrame(track)
  }

  private stopTracking(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  // ─── Private: Pin Configuration ────────────────────────────────

  private configurePinNode(
    node: HTMLDivElement,
    property: GlobePropertyData,
    offset: LayoutOffset,
    onPinClick: (property: GlobePropertyData) => void,
    onPinHover: (property: GlobePropertyData | null) => void,
  ): void {
    // Store offset for hover handlers
    node.dataset.offsetX = String(offset.x)
    node.dataset.offsetY = String(offset.y)
    node.dataset.propertyId = String(property.id)

    // Initial position (collapsed to center)
    node.style.transform = 'translate(-50%, -50%) scale(0)'
    node.style.opacity = '0'

    // Set thumbnail image if available
    const inner = node.querySelector('[data-pin-inner]') as HTMLDivElement | null
    if (inner) {
      if (property.img) {
        inner.style.backgroundImage = `url(${property.img})`
        inner.textContent = ''
      } else {
        inner.style.backgroundImage = ''
        inner.textContent = '●'
      }
    }

    // Event handlers
    node.onclick = (e: MouseEvent) => {
      e.stopPropagation()
      onPinClick(property)
    }

    node.onmouseenter = () => onPinHover(property)
    node.onmouseleave = () => onPinHover(null)
  }

  // ─── Private: Center Dot ───────────────────────────────────────

  private createCenterDot(): void {
    this.removeCenterDot()

    const dot = document.createElement('div')
    dot.dataset.centerDot = 'true'
    dot.style.cssText = [
      'position: absolute',
      'width: 12px',
      'height: 12px',
      'border-radius: 50%',
      `background: ${GOLD_ROYAL}`,
      'border: 2px solid white',
      `box-shadow: 0 0 15px ${GOLD_ROYAL}`,
      'transform: translate(-50%, -50%)',
      'pointer-events: none',
      'z-index: 1',
    ].join('; ')

    this.overlay.appendChild(dot)
  }

  private removeCenterDot(): void {
    const existing = this.overlay.querySelector('[data-center-dot]')
    if (existing) existing.remove()
  }
}
