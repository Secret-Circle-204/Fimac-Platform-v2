/**
 * ═══════════════════════════════════════════════════════════════════
 *  FIMAC Globe Clustering Engine — Cluster Controller (Orchestrator)
 * ═══════════════════════════════════════════════════════════════════
 *
 *  The central orchestrator. Receives events from the Globe,
 *  queries the SpatialIndex, and delegates to specialized controllers.
 *
 *  This controller DELEGATES — it never executes rendering,
 *  animation, or DOM manipulation directly.
 */

import type { ClusterPoint, ClusterEventHandlers, FSMTransition } from './types'
import type { GlobeMethods } from 'react-globe.gl'
import { SpatialIndex } from './spatial-index'
import { PoolManager } from './pool-manager'
import { LayoutCache } from './layout-cache'
import { AnimationController } from './animation-controller'
import { OverlayRenderer } from './overlay-renderer'
import type { ScreenProjection } from './overlay-renderer'
import { CLUSTER_CONFIG } from './config'
import { isValidCoordinate } from '@/lib/geo/is-valid-coordinate'

/**
 * ClusterController is the main entry point for the clustering system.
 * It wires up all sub-controllers and exposes a clean API to the React component.
 *
 * Usage:
 * ```tsx
 * // In React component:
 * const controller = useRef<ClusterController>()
 *
 * useEffect(() => {
 *   controller.current = new ClusterController(containerEl, getScreenCoords, handlers)
 *   controller.current.loadProperties(properties)
 *   return () => controller.current?.dispose()
 * }, [])
 * ```
 */
export class ClusterController {
  private readonly spatialIndex: SpatialIndex
  private readonly poolManager: PoolManager
  private readonly layoutCache: LayoutCache
  private readonly animationController: AnimationController
  private readonly overlayRenderer: OverlayRenderer

  /** Cached visible clusters for the current viewport */
  private visibleClusters: ClusterPoint[] = []

  /** Reference to globe methods for camera control */
  private globeRef: React.RefObject<GlobeMethods | undefined> | null = null

  /** Pending cluster to expand after closing animation finishes */
  private pendingCluster: ClusterPoint | null = null

  constructor(
    container: HTMLElement,
    getScreenCoords: ScreenProjection,
    private readonly handlers: ClusterEventHandlers,
  ) {
    this.spatialIndex = new SpatialIndex()
    this.poolManager = new PoolManager(CLUSTER_CONFIG.maxClusterExpansion)
    this.layoutCache = new LayoutCache(
      CLUSTER_CONFIG.maxClusterExpansion,
      CLUSTER_CONFIG.spiderfyRadius,
    )
    this.animationController = new AnimationController()
    this.overlayRenderer = new OverlayRenderer(
      container,
      this.poolManager,
      this.layoutCache,
      getScreenCoords,
    )

    // Wire up FSM transitions
    this.animationController.onTransition(this.handleFSMTransition)
  }

  /**
   * Sets the globe ref for camera control (fly-to, etc).
   * Call this when the globe mounts.
   */
  setGlobeRef(ref: React.RefObject<GlobeMethods | undefined>): void {
    this.globeRef = ref
  }

  /**
   * Loads property data into the spatial index.
   * Call when properties change. O(N log N) build.
   */
  loadProperties(properties: import('@/payload-types').Property[]): number {
    return this.spatialIndex.load(properties)
  }

  /**
   * Updates visible clusters based on current camera position.
   * Call on every camera change (zoom, rotate, pan).
   *
   * @returns The new array of visible ClusterPoints for rendering
   */
  updateVisibleClusters(
    cameraLat: number,
    cameraLng: number,
    altitude: number,
  ): ClusterPoint[] {
    this.visibleClusters = this.spatialIndex.getClustersForAltitude(
      cameraLat,
      cameraLng,
      altitude,
    )
    return this.visibleClusters
  }

  /**
   * Handles a click on a cluster/point from the globe.
   * Decides between spiderfy, zoom, or direct selection.
   */
  handlePointClick(point: ClusterPoint): void {
    if (point.isCluster && point.clusterId !== null) {
      this.handleClusterClick(point)
    } else {
      // Individual property — close any open spiderfy, then select
      if (this.animationController.state !== 'Idle') {
        this.requestClose()
      }
      this.handlers.onPropertySelect(point.representative)
    }
  }

  /**
   * Handles hover on a cluster/point.
   * Dispatches hover event to the parent component.
   */
  handlePointHover(point: ClusterPoint | null): void {
    if (point) {
      this.handlers.onPropertyHover(point.representative)
    } else {
      this.handlers.onPropertyHover(null)
    }
  }

  /**
   * Requests closing the current spiderfy expansion.
   */
  requestClose(): void {
    if (this.animationController.state === 'Idle') return
    this.animationController.requestClose()
  }

  /** Current FSM state */
  get state() {
    return this.animationController.state
  }

  /** Whether a spiderfy expansion is currently active */
  get isExpanded(): boolean {
    return this.animationController.state === 'Expanded'
  }

  /** Currently expanded cluster (null when idle) */
  get activeCluster(): ClusterPoint | null {
    return this.animationController.cluster
  }

  /**
   * Disposes all controllers and frees resources.
   * Call on component unmount.
   */
  dispose(): void {
    this.overlayRenderer.dispose()
    this.poolManager.dispose()
    this.animationController.dispose()
    this.visibleClusters = []
    this.globeRef = null
  }

  // ─── Private: Cluster Click Handling ───────────────────────────

  private handleClusterClick(cluster: ClusterPoint): void {
    if (cluster.clusterId === null) return

    if (cluster.pointCount <= CLUSTER_CONFIG.maxClusterExpansion) {
      // Small cluster → spiderfy expansion
      this.requestSpiderfy(cluster)
    } else {
      // Large cluster → fly to and zoom in
      this.requestZoomIn(cluster)
    }
  }

  private requestSpiderfy(cluster: ClusterPoint): void {
    if (cluster.clusterId === null) return

    // If the FSM is not Idle, close the active cluster first and queue the new one
    if (this.animationController.state !== 'Idle') {
      if (this.animationController.cluster?.id === cluster.id) {
        this.requestClose()
      } else {
        this.pendingCluster = cluster
        this.requestClose()
      }
      return
    }

    // First fly the camera to the cluster location
    this.flyTo(cluster.lat, cluster.lng, 0.5, 800)

    // Then open the spiderfy after flight completes
    const openAfterFlight = (): void => {
      const opened = this.animationController.requestOpen(cluster)
      if (opened) {
        const leaves = this.spatialIndex.getClusterLeaves(
          cluster.clusterId as number,
          CLUSTER_CONFIG.maxClusterExpansion,
        )

        this.overlayRenderer.open(
          cluster,
          leaves,
          (property) => this.handlers.onPropertySelect(property),
          (property) => this.handlers.onPropertyHover(property),
        )

        // Start fallback timer, then confirm opened
        this.animationController.startFallbackTimer(() => {
          this.animationController.confirmOpened()
        })

        // Confirm opened after animation duration
        setTimeout(() => {
          this.animationController.confirmOpened()
        }, CLUSTER_CONFIG.animationDurationMs)
      }
    }

    // Delay opening to allow camera flight
    setTimeout(openAfterFlight, 850)
  }

  private requestZoomIn(cluster: ClusterPoint): void {
    if (cluster.clusterId === null) return

    // Close any open spiderfy first
    if (this.animationController.state !== 'Idle') {
      this.requestClose()
    }

    // Get the zoom level that would expand this cluster
    const expansionZoom = this.spatialIndex.getExpansionZoom(cluster.clusterId)

    // Convert expansion zoom back to altitude
    const targetAltitude = Math.max(
      0.2,
      CLUSTER_CONFIG.zoomInAltitude / Math.max(1, expansionZoom / 4),
    )

    this.flyTo(cluster.lat, cluster.lng, targetAltitude, 1500)
  }

  // ─── Private: FSM Transition Handler ──────────────────────────

  private handleFSMTransition = (transition: FSMTransition): void => {
    if (transition.to === 'Closing') {
      this.overlayRenderer.close(() => {
        this.animationController.confirmClosed()
      })
      if (this.handlers.onClusterExpand) {
        this.handlers.onClusterExpand(null)
      }
    }

    if (transition.to === 'Idle') {
      if (this.pendingCluster) {
        const nextCluster = this.pendingCluster
        this.pendingCluster = null
        this.requestSpiderfy(nextCluster)
      }
    }

    if (transition.to === 'Opening' && this.animationController.cluster) {
      if (this.handlers.onClusterExpand) {
        this.handlers.onClusterExpand(this.animationController.cluster.id)
      }
    }
  }

  // ─── Private: Camera Control ──────────────────────────────────

  private flyTo(lat: number, lng: number, altitude: number, durationMs: number): boolean {
    if (!this.globeRef?.current) return false
    if (!isValidCoordinate(lat, lng)) return false

    try {
      this.globeRef.current.pointOfView({ lat, lng, altitude }, durationMs)
      return true
    } catch (err) {
      console.error('[ClusterController] Camera fly-to failed:', err)
      return false
    }
  }
}
