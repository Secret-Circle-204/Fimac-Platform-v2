/**
 * ═══════════════════════════════════════════════════════════════════
 *  FIMAC Globe Clustering Engine — Centralized Configuration
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Single source of truth for all tuning parameters.
 *  Every magic number lives here — NEVER hardcode values elsewhere.
 */

import type { ClusterConfig } from './types'

/**
 * Frozen configuration object.
 * Tuned for 10,000+ properties at 60 FPS.
 */
export const CLUSTER_CONFIG: ClusterConfig = Object.freeze({
  /** Max pins in a spiderfy expansion (drives PoolManager allocation) */
  maxClusterExpansion: 36,

  /** Pixel radius of the spiderfy radial fan-out */
  spiderfyRadius: 120,

  /** Duration of open/close animations (ms) */
  animationDurationMs: 400,

  /** Supercluster: merge radius in pixels at zoom 0 */
  clusterRadius: 60,

  /** Supercluster: max zoom for clustering (above this, all points are individual) */
  clusterMaxZoom: 16,

  /** Camera altitude to fly to when expanding a large cluster via zoom */
  zoomInAltitude: 0.6,
})

// ─── Design Tokens (Brand Colors) ──────────────────────────────

/** Fimac gold (#a18052) used for pins, glows, and accents */
export const GOLD_ROYAL = '#a18052'

/** Light gold for gradients */
export const GOLD_LIGHT = '#c9a96e'

/** Deep navy for backgrounds */
export const NAVY_DEEP = '#153075'

// ─── Performance Budgets ────────────────────────────────────────

/** Maximum rAF frame budget in ms (target: < 2ms per frame for 60fps) */
export const RAF_BUDGET_MS = 2

/** Camera altitude → supercluster zoom mapping constants */
export const ALTITUDE_ZOOM_FACTOR = 4
export const ALTITUDE_ZOOM_MIN = 0
export const ALTITUDE_ZOOM_MAX = 16
