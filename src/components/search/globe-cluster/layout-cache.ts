/**
 * ═══════════════════════════════════════════════════════════════════
 *  FIMAC Globe Clustering Engine — Layout Cache (Math Engine)
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Precomputes ALL radial trigonometry at initialization time.
 *  Zero Math.cos/Math.sin calls during runtime interactions.
 *
 *  Uses the golden angle (≈137.508°) for aesthetically pleasing
 *  spiral layouts — same algorithm used in sunflower seed patterns.
 */

/** A precomputed [x, y] offset pair for a pin position */
export interface LayoutOffset {
  readonly x: number
  readonly y: number
}

/**
 * LayoutCache precomputes radial pin positions for spiderfy expansions.
 *
 * Usage:
 * ```ts
 * const cache = new LayoutCache(8, 85)
 * const positions = cache.getLayout(5)
 * // → [{x: 85, y: 0}, {x: -42, y: 73}, ...]
 * ```
 */
export class LayoutCache {
  /** Precomputed layouts indexed by pin count (1..maxPins) */
  private readonly layouts: ReadonlyMap<number, readonly LayoutOffset[]>

  /**
   * @param maxPins - Maximum number of pins (drives precomputation depth)
   * @param radius - Pixel radius of the spiderfy circle
   */
  constructor(maxPins: number, radius: number) {
    const computed = new Map<number, readonly LayoutOffset[]>()

    for (let count = 1; count <= maxPins; count++) {
      const offsets: LayoutOffset[] = []

      if (count === 1) {
        // Single pin: center position (no offset)
        offsets.push({ x: 0, y: 0 })
      } else if (count === 2) {
        // Two pins: opposite sides on a line
        offsets.push({ x: -radius * 0.6, y: 0 })
        offsets.push({ x: radius * 0.6, y: 0 })
      } else {
        // 3+ pins: golden angle spiral for even distribution
        const goldenAngle = Math.PI * (3 - Math.sqrt(5)) // ≈ 2.3999 rad ≈ 137.508°

        for (let i = 0; i < count; i++) {
          const angle = i * goldenAngle
          // Scale radius slightly per pin to avoid overlap
          const r = radius * (0.5 + (0.5 * (i + 1)) / count)
          offsets.push({
            x: Math.round(Math.cos(angle) * r * 100) / 100,
            y: Math.round(Math.sin(angle) * r * 100) / 100,
          })
        }
      }

      computed.set(count, Object.freeze(offsets))
    }

    this.layouts = computed
  }

  /**
   * Returns the precomputed layout for a given pin count.
   * Guaranteed O(1) — no computation at runtime.
   *
   * @param pinCount - Number of pins to layout (clamped to [1, maxPins])
   * @returns Frozen array of [x, y] offsets
   */
  getLayout(pinCount: number): readonly LayoutOffset[] {
    const clamped = Math.max(1, Math.min(pinCount, this.layouts.size))
    const layout = this.layouts.get(clamped)
    if (!layout) {
      // Defensive: should never happen due to clamping
      return [{ x: 0, y: 0 }]
    }
    return layout
  }
}
