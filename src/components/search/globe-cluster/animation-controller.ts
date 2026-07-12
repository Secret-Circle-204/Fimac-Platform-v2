/**
 * ═══════════════════════════════════════════════════════════════════
 *  FIMAC Globe Clustering Engine — Animation Controller (FSM)
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Strict Finite State Machine preventing race conditions.
 *  States: Idle → Opening → Expanded → Closing → Idle
 *
 *  Guarantees:
 *  - Rapid-fire clicks are queued or gracefully ignored
 *  - transitionend events drive timing (no setTimeout guessing)
 *  - PoolManager nodes are reclaimed ONLY after Closing completes
 */

import type { FSMState, FSMTransition, ClusterPoint } from './types'
import { CLUSTER_CONFIG } from './config'

/** Callback invoked on every FSM state transition */
export type FSMListener = (transition: FSMTransition) => void

/**
 * Valid transitions in the FSM.
 * Any transition not in this map is REJECTED (prevents corruption).
 */
const VALID_TRANSITIONS: Record<FSMState, FSMState[]> = {
  Idle: ['Opening'],
  Opening: ['Expanded', 'Closing'], // Closing allows cancel during open
  Expanded: ['Closing'],
  Closing: ['Idle'],
}

/**
 * AnimationController manages the Idle→Opening→Expanded→Closing→Idle lifecycle.
 *
 * Usage:
 * ```ts
 * const fsm = new AnimationController()
 * fsm.onTransition((t) => console.log(`${t.from} → ${t.to}`))
 * fsm.requestOpen(clusterPoint)  // Idle → Opening
 * fsm.confirmOpened()            // Opening → Expanded
 * fsm.requestClose()             // Expanded → Closing
 * fsm.confirmClosed()            // Closing → Idle
 * ```
 */
export class AnimationController {
  private currentState: FSMState = 'Idle'
  private activeCluster: ClusterPoint | null = null
  private listeners: FSMListener[] = []



  /** Fallback timer in case transitionend doesn't fire (e.g., display:none) */
  private fallbackTimer: ReturnType<typeof setTimeout> | null = null

  /** Current FSM state (read-only) */
  get state(): FSMState {
    return this.currentState
  }

  /** The cluster currently being expanded (null when Idle) */
  get cluster(): ClusterPoint | null {
    return this.activeCluster
  }

  /** Register a listener for state transitions */
  onTransition(listener: FSMListener): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  /**
   * Request to open/expand a cluster.
   * - From Idle: transitions to Opening
   */
  requestOpen(cluster: ClusterPoint): boolean {
    if (this.currentState === 'Idle') {
      this.activeCluster = cluster
      return this.transition('Opening')
    }
    return false
  }

  /**
   * Confirm that the Opening animation has completed.
   * Transitions Opening → Expanded.
   */
  confirmOpened(): boolean {
    this.clearFallbackTimer()
    return this.transition('Expanded')
  }

  /**
   * Request to close the current expansion.
   * - From Expanded: transitions to Closing
   */
  requestClose(): boolean {
    if (this.currentState === 'Expanded') {
      return this.transition('Closing')
    }
    return false
  }

  /**
   * Confirm that the Closing animation has completed.
   * Transitions Closing → Idle.
   */
  confirmClosed(): boolean {
    this.clearFallbackTimer()
    this.activeCluster = null
    return this.transition('Idle')
  }

  /**
   * Starts a fallback timer for the current transition.
   * If transitionend doesn't fire within the budget, force-complete.
   *
   * @param onTimeout - Callback to invoke on fallback
   */
  startFallbackTimer(onTimeout: () => void): void {
    this.clearFallbackTimer()
    // Add 100ms buffer beyond animation duration
    this.fallbackTimer = setTimeout(() => {
      console.warn(`[AnimationController] Fallback timer fired in state: ${this.currentState}`)
      onTimeout()
    }, CLUSTER_CONFIG.animationDurationMs + 100)
  }

  /** Force-reset the FSM to Idle (emergency recovery) */
  forceReset(): void {
    this.clearFallbackTimer()
    const from = this.currentState
    this.currentState = 'Idle'
    this.activeCluster = null
    this.emit({ from, to: 'Idle' })
  }

  /** Clean up resources */
  dispose(): void {
    this.clearFallbackTimer()
    this.listeners = []
    this.activeCluster = null
    this.currentState = 'Idle'
  }

  // ─── Private ────────────────────────────────────────────────────

  private transition(to: FSMState): boolean {
    const from = this.currentState
    const validTargets = VALID_TRANSITIONS[from]

    if (!validTargets.includes(to)) {
      console.warn(`[AnimationController] Invalid transition: ${from} → ${to}`)
      return false
    }

    this.currentState = to
    this.emit({ from, to })
    return true
  }

  private emit(transition: FSMTransition): void {
    for (const listener of this.listeners) {
      try {
        listener(transition)
      } catch (err) {
        console.error('[AnimationController] Listener error:', err)
      }
    }
  }

  private clearFallbackTimer(): void {
    if (this.fallbackTimer !== null) {
      clearTimeout(this.fallbackTimer)
      this.fallbackTimer = null
    }
  }
}
