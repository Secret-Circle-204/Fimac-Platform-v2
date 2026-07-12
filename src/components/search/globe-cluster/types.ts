/**
 * ═══════════════════════════════════════════════════════════════════
 *  FIMAC Globe Clustering Engine — Core Type Definitions
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Single source of truth for the entire clustering module's type system.
 *  Every controller, renderer, and manager imports from here.
 *
 *  NEVER define ad-hoc types in individual controller files.
 */

// ─── Finite State Machine ───────────────────────────────────────

/** Strict FSM states for the cluster expansion lifecycle */
export type FSMState = 'Idle' | 'Opening' | 'Expanded' | 'Closing'

/** FSM transition event emitted on every state change */
export interface FSMTransition {
  readonly from: FSMState
  readonly to: FSMState
}

// ─── Globe Data Types ───────────────────────────────────────────

/**
 * Individual property data extracted and optimized for globe rendering.
 * Also satisfies the MapPortalProperty contract (via field mapping).
 */
export interface GlobePropertyData {
  readonly id: string | number
  readonly lat: number
  readonly lng: number
  readonly title: string | null | undefined
  readonly price: number | null | undefined
  readonly currency: string | null | undefined
  readonly status: string | null | undefined
  readonly beds: number | null | undefined
  readonly baths: number | null | undefined
  readonly sqM: number | null | undefined
  readonly type: string | null | undefined
  readonly img: string | null | undefined
  readonly city: string | null | undefined
  readonly state: string | null | undefined
  readonly url: string
}

/**
 * A point rendered on the globe — either a spatial cluster or an individual property.
 * Produced by SpatialIndex.getClusters().
 */
export interface ClusterPoint {
  /** Unique identifier: cluster_id for clusters, property id for leaves */
  readonly id: string | number
  /** Display latitude (cluster center or property coordinates) */
  readonly lat: number
  /** Display longitude (cluster center or property coordinates) */
  readonly lng: number
  /** True when this point represents multiple aggregated properties */
  readonly isCluster: boolean
  /** Supercluster internal cluster ID. null for individual properties */
  readonly clusterId: number | null
  /** Number of properties aggregated in this cluster (1 for individuals) */
  readonly pointCount: number
  /** First/representative property data for display */
  readonly representative: GlobePropertyData
  /** Up to 3 thumbnail URLs for stacked card preview */
  readonly clusterImages?: string[]
}

/**
 * GeoJSON properties stored inside the supercluster index.
 * This is the payload attached to each GeoJSON Feature point.
 */
export interface SuperclusterPropertyPayload {
  readonly propertyData: GlobePropertyData
}

// ─── Spiderfy Types ─────────────────────────────────────────────

/** A pin in the spiderfy radial expansion */
export interface SpiderfyPin {
  readonly property: GlobePropertyData
  readonly offsetX: number
  readonly offsetY: number
  readonly node: HTMLDivElement
}

// ─── Configuration ──────────────────────────────────────────────

/** Immutable configuration for the clustering system */
export interface ClusterConfig {
  /** Max number of pins to show in a spiderfy expansion */
  readonly maxClusterExpansion: number
  /** Pixel radius of the spiderfy circle */
  readonly spiderfyRadius: number
  /** Animation duration in milliseconds */
  readonly animationDurationMs: number
  /** Supercluster radius parameter (in pixels at zoom 0) */
  readonly clusterRadius: number
  /** Maximum zoom level for clustering (above this, no clustering) */
  readonly clusterMaxZoom: number
  /** Camera altitude to fly to when zooming into a large cluster */
  readonly zoomInAltitude: number
}

// ─── Event Callbacks ────────────────────────────────────────────

/** Callback contract for the parent React component */
export interface ClusterEventHandlers {
  readonly onPropertySelect: (property: GlobePropertyData) => void
  readonly onPropertyHover: (property: GlobePropertyData | null) => void
  readonly onClusterExpand?: (clusterId: string | number | null) => void
}
