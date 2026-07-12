import { EventEmitter } from 'node:events'
import type { Property, SellerRequest } from '@/payload-types'

// ── Event Payload Definitions ──────────────────────────────────────────────

/**
 * Emitted after a SellerRequest is successfully published as a live Property.
 * Contains full document references for downstream consumers.
 */
export interface PropertyPublishedEvent {
  /** The newly created Property document */
  property: Property
  /** The original SellerRequest that was published */
  sellerRequest: SellerRequest
  /** The ID of the admin user who initiated the publish action */
  publishedBy: number | string
  /** ISO-8601 timestamp of the publish action */
  publishedAt: string
}

// ── Type-Safe Event Map ────────────────────────────────────────────────────

interface PropertyEventMap {
  'property:published': [PropertyPublishedEvent]
}

// ── Typed Event Emitter ────────────────────────────────────────────────────

class TypedPropertyEventEmitter extends EventEmitter {
  override emit<K extends keyof PropertyEventMap>(
    event: K,
    ...args: PropertyEventMap[K]
  ): boolean {
    return super.emit(event, ...args)
  }

  override on<K extends keyof PropertyEventMap>(
    event: K,
    listener: (...args: PropertyEventMap[K]) => void,
  ): this {
    return super.on(event, listener as (...args: unknown[]) => void)
  }
}

// ── Singleton Instance ─────────────────────────────────────────────────────

/**
 * Global event bus for property-related domain events.
 *
 * The publishing service emits events here after successful operations.
 * Downstream listeners (email, cache, analytics) subscribe independently,
 * keeping the service layer decoupled from side-effects.
 */
export const propertyEvents = new TypedPropertyEventEmitter()

// ── Default Listeners ──────────────────────────────────────────────────────

/**
 * Audit log listener — records every publish action for traceability.
 * Uses console.info as a structured log sink; integrates with any
 * external logging infrastructure that captures stdout.
 */
propertyEvents.on('property:published', (event) => {
  console.info(
    `[PropertyPublished] Admin ${String(event.publishedBy)} published SellerRequest #${event.sellerRequest.id} → Property #${event.property.id} at ${event.publishedAt}`,
  )
})
