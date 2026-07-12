/**
 * ═══════════════════════════════════════════════════════════════════
 *  FIMAC Globe Clustering Engine — Barrel Export
 * ═══════════════════════════════════════════════════════════════════
 */

// Core types
export type {
  FSMState,
  FSMTransition,
  GlobePropertyData,
  ClusterPoint,
  SuperclusterPropertyPayload,
  SpiderfyPin,
  ClusterConfig,
  ClusterEventHandlers,
} from './types'

// Configuration
export { CLUSTER_CONFIG, GOLD_ROYAL, GOLD_LIGHT, NAVY_DEEP } from './config'

// Controllers
export { SpatialIndex } from './spatial-index'
export { PoolManager } from './pool-manager'
export { LayoutCache } from './layout-cache'
export { AnimationController } from './animation-controller'
export { OverlayRenderer } from './overlay-renderer'
export { ClusterController } from './cluster-controller'
