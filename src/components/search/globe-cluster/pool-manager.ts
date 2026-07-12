/**
 * ═══════════════════════════════════════════════════════════════════
 *  FIMAC Globe Clustering Engine — Pool Manager (Flyweight Allocator)
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Pre-creates a fixed pool of DOM nodes at initialization.
 *  Zero createElement() calls during runtime interaction.
 *
 *  The pool guarantees:
 *  - No GC pressure from DOM allocation during animation
 *  - Constant memory footprint (flat-line in DevTools)
 *  - Deterministic allocation/deallocation lifecycle
 */

import { GOLD_ROYAL, GOLD_LIGHT } from './config'

/**
 * PoolManager manages a fixed-size pool of reusable DOM nodes
 * for the spiderfy pin expansion.
 *
 * Usage:
 * ```ts
 * const pool = new PoolManager(8)
 * const node = pool.borrow()       // get a node
 * pool.return(node)                 // give it back
 * pool.returnAll()                  // reclaim everything
 * pool.dispose()                    // cleanup on unmount
 * ```
 */
export class PoolManager {
  private readonly freePool: HTMLDivElement[] = []
  private readonly activeSet = new Set<HTMLDivElement>()

  /**
   * @param maxSize - Number of DOM nodes to pre-create (matches maxClusterExpansion)
   */
  constructor(private readonly maxSize: number) {
    for (let i = 0; i < maxSize; i++) {
      this.freePool.push(this.createPinNode())
    }
  }

  /**
   * Borrows a DOM node from the pool.
   * Returns null if pool is exhausted (should never happen with proper config).
   */
  borrow(): HTMLDivElement | null {
    const node = this.freePool.pop()
    if (!node) {
      console.warn('[PoolManager] Pool exhausted — all nodes are active')
      return null
    }
    this.activeSet.add(node)
    return node
  }

  /**
   * Returns a single node to the pool after use.
   * Resets the node to its dormant state.
   */
  return(node: HTMLDivElement): void {
    if (!this.activeSet.has(node)) return
    this.activeSet.delete(node)
    this.resetNode(node)
    this.freePool.push(node)
  }

  /**
   * Returns ALL active nodes to the pool.
   * Called when closing a spiderfy expansion.
   */
  returnAll(): void {
    for (const node of this.activeSet) {
      this.resetNode(node)
      this.freePool.push(node)
    }
    this.activeSet.clear()
  }

  /** Number of currently borrowed nodes */
  get activeCount(): number {
    return this.activeSet.size
  }

  /** Number of available nodes */
  get freeCount(): number {
    return this.freePool.length
  }

  /**
   * Disposes ALL nodes (both free and active).
   * Call on component unmount to prevent memory leaks.
   */
  dispose(): void {
    for (const node of this.activeSet) {
      if (node.parentNode) node.parentNode.removeChild(node)
    }
    this.activeSet.clear()

    for (const node of this.freePool) {
      if (node.parentNode) node.parentNode.removeChild(node)
    }
    this.freePool.length = 0
  }

  // ─── Private: Node Factory ──────────────────────────────────────

  /**
   * Creates a single luxury-styled pin DOM node.
   * Called ONLY at initialization — never during runtime.
   */
  private createPinNode(): HTMLDivElement {
    const node = document.createElement('div')

    // Outer pin container — absolutely positioned, GPU-promoted
    node.style.cssText = [
      'position: absolute',
      'width: 44px',
      'height: 44px',
      'border-radius: 50%',
      `background: linear-gradient(135deg, ${GOLD_ROYAL} 0%, ${GOLD_LIGHT} 50%, ${GOLD_ROYAL} 100%)`,
      'border: 3px solid rgba(255, 255, 255, 0.9)',
      `box-shadow: 0 0 20px rgba(161, 128, 82, 0.6), 0 4px 12px rgba(0, 0, 0, 0.3)`,
      'cursor: pointer',
      'opacity: 0',
      'pointer-events: none',
      'will-change: transform, opacity',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'overflow: hidden',
      'z-index: 5',
      'transition: transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.25s ease-out, box-shadow 0.25s ease',
    ].join('; ')

    // Inner content area (for thumbnails or icons)
    const inner = document.createElement('div')
    inner.style.cssText = [
      'width: 100%',
      'height: 100%',
      'border-radius: 50%',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'color: white',
      'font-size: 10px',
      'font-weight: 700',
      'text-transform: uppercase',
      'letter-spacing: 0.05em',
      'background-size: cover',
      'background-position: center',
    ].join('; ')
    inner.dataset.pinInner = 'true'
    node.appendChild(inner)

    // Hover handlers — manipulate only GPU-friendly properties
    node.addEventListener('mouseenter', () => {
      const ox = node.dataset.offsetX || '0'
      const oy = node.dataset.offsetY || '0'
      node.style.transform = `translate(calc(${ox}px - 50%), calc(${oy}px - 50%)) scale(1.25)`
      node.style.boxShadow = `0 0 40px rgba(161, 128, 82, 0.9), 0 8px 20px rgba(0, 0, 0, 0.4)`
    })

    node.addEventListener('mouseleave', () => {
      const ox = node.dataset.offsetX || '0'
      const oy = node.dataset.offsetY || '0'
      node.style.transform = `translate(calc(${ox}px - 50%), calc(${oy}px - 50%)) scale(1)`
      node.style.boxShadow = `0 0 20px rgba(161, 128, 82, 0.6), 0 4px 12px rgba(0, 0, 0, 0.3)`
    })

    return node
  }

  /**
   * Resets a node to its dormant (invisible, non-interactive) state.
   * Does NOT remove from DOM — OverlayRenderer manages attachment.
   */
  private resetNode(node: HTMLDivElement): void {
    node.style.opacity = '0'
    node.style.pointerEvents = 'none'
    node.style.transform = 'translate(-50%, -50%) scale(0)'
    node.dataset.offsetX = '0'
    node.dataset.offsetY = '0'
    node.dataset.propertyId = ''
    node.onclick = null

    // Reset inner content
    const inner = node.querySelector('[data-pin-inner]') as HTMLDivElement | null
    if (inner) {
      inner.style.backgroundImage = ''
      inner.textContent = ''
    }
  }
}
