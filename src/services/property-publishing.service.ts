import type { PayloadRequest } from 'payload'
import { initTransaction, commitTransaction, killTransaction } from 'payload'
import type { Property } from '@/payload-types'
import { propertyEvents } from '@/lib/events/property-events'

// ── Result Type ────────────────────────────────────────────────────────────

interface PublishResult {
  property: Property
  /** True when the property already existed and was returned idempotently */
  alreadyPublished: boolean
}

// ── Helper: Extract relationship ID ────────────────────────────────────────

/**
 * Safely extracts the numeric ID from a Payload relationship field value
 * that may be a number, null, or a populated document object.
 */
function extractRelationshipId(
  value: number | null | undefined | { id: number | string },
): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  if (typeof value === 'object' && 'id' in value) return Number(value.id)
  return null
}

// ── Service ────────────────────────────────────────────────────────────────

export class PropertyPublishingService {
  /**
   * Publishes a SellerRequest as a live Property document.
   *
   * - Transaction-safe: all writes are wrapped in a single DB transaction.
   * - Idempotent: checks `publishedProperty` relationship AND existing
   *   properties linked via `seller_request` before creating anything new.
   * - Event-driven: emits `property:published` after successful commit.
   */
  async publishRequest(
    requestId: number | string,
    req: PayloadRequest,
  ): Promise<PublishResult> {
    const { payload } = req
    const numericId = Number(requestId)

    if (!Number.isFinite(numericId)) {
      throw new Error(`Invalid seller request ID: ${String(requestId)}`)
    }

    // ── Start Transaction ────────────────────────────────────────────────
    const shouldCommit = await initTransaction(req)

    try {
      // ── 1. Load the SellerRequest ──────────────────────────────────────
      const sellerRequest = await payload.findByID({
        collection: 'seller-requests',
        id: numericId,
        depth: 0,
        req,
      })

      if (!sellerRequest) {
        throw new Error(`Seller request #${numericId} not found`)
      }

      // ── 2. Idempotency Check A: publishedProperty field exists ────────
      const existingPropertyId = extractRelationshipId(
        sellerRequest.publishedProperty as number | null | undefined | { id: number | string },
      )

      if (existingPropertyId !== null) {
        const existingProperty = await payload.findByID({
          collection: 'properties',
          id: String(existingPropertyId),
          depth: 0,
          req,
        })

        if (existingProperty) {
          if (shouldCommit) await commitTransaction(req)

          payload.logger.info(
            `[PropertyPublishing] Idempotent return: SellerRequest #${numericId} already linked to Property #${existingProperty.id}`,
          )

          return { property: existingProperty, alreadyPublished: true }
        }
      }

      // ── 3. Idempotency Check B: fallback query on properties table ────
      const existingProperties = await payload.find({
        collection: 'properties',
        where: {
          seller_request: { equals: numericId },
        },
        limit: 1,
        depth: 0,
        req,
      })

      if (existingProperties.docs.length > 0) {
        const orphanedProperty = existingProperties.docs[0]

        // Heal the missing reference on the SellerRequest
        await payload.update({
          collection: 'seller-requests',
          id: numericId,
          data: {
            status: 'listed',
            publishedProperty: orphanedProperty.id,
          },
          req,
        })

        if (shouldCommit) await commitTransaction(req)

        payload.logger.info(
          `[PropertyPublishing] Healed orphan: SellerRequest #${numericId} re-linked to existing Property #${orphanedProperty.id}`,
        )

        return { property: orphanedProperty, alreadyPublished: true }
      }

      // ── 4. Validate publishability ─────────────────────────────────────
      if (sellerRequest.status === 'rejected') {
        throw new Error(
          `Seller request #${numericId} is rejected and cannot be published`,
        )
      }

      // ── 5. Transform & Map SellerRequest → Property Data ──────────────
      const sellerId = extractRelationshipId(sellerRequest.seller)
      const propertyTypeId = extractRelationshipId(
        sellerRequest.property_type as number | { id: number },
      )

      // Fetch property type category slug
      let category: 'residential' | 'commercial' | 'hospitality' | 'land' = 'residential'
      if (propertyTypeId) {
        const pType = await payload.findByID({
          collection: 'property-types',
          id: propertyTypeId,
          depth: 1,
        })
        if (pType && pType.category) {
          const catObj = pType.category
          const slug = typeof catObj === 'object' && catObj !== null ? catObj.slug : undefined
          if (slug === 'residential' || slug === 'commercial' || slug === 'hospitality' || slug === 'land') {
            category = slug
          }
        }
      }

      // Get the 'forsale' / 'for-sale' listing status ID from database
      const listingStatusResult = await payload.find({
        collection: 'listing-statuses',
        where: {
          or: [
            { slug: { equals: 'forsale' } },
            { slug: { equals: 'for-sale' } },
          ],
        },
        limit: 1,
      })
      const forsaleStatusId = listingStatusResult.docs[0]?.id

      const propertyData = {
        title: sellerRequest.property_title,
        description: sellerRequest.property_description,
        propertyType: propertyTypeId,
        price: sellerRequest.asking_price,
        currency: sellerRequest.currency,
        listingStatus: forsaleStatusId,
        constructionStatus: sellerRequest.constructionStatus,
        category,
        area: sellerRequest.property_size ?? undefined,
        residential: category === 'residential' ? {
          bedrooms: sellerRequest.bedrooms ?? undefined,
          bathrooms: sellerRequest.bathrooms ?? undefined,
        } : undefined,
        seller: sellerId,
        seller_request: numericId,
        // Feed the Google Maps URL into the smart location helper
        // so that the Property's beforeChange hook auto-resolves geocoding
        mapsUrlInput: sellerRequest.google_maps_url ?? undefined,
        location: {
          geo: {
            lat: sellerRequest.latitude ?? undefined,
            lng: sellerRequest.longitude ?? undefined,
          },
          address: {
            street: sellerRequest.property_location,
            city: sellerRequest.city,
            state: sellerRequest.state,
            country: sellerRequest.country,
          },
        },
      }

      // ── 6. Create Property ─────────────────────────────────────────────
      const newProperty = await payload.create({
        collection: 'properties',
        data: propertyData,
        req,
      })

      // ── 7. Update SellerRequest ────────────────────────────────────────
      const updatedRequest = await payload.update({
        collection: 'seller-requests',
        id: numericId,
        data: {
          status: 'listed',
          publishedProperty: newProperty.id,
        },
        req,
      })

      // ── 8. Commit Transaction ──────────────────────────────────────────
      if (shouldCommit) await commitTransaction(req)

      // ── 9. Audit Log ──────────────────────────────────────────────────
      const adminUserId = req.user
        ? ('id' in req.user ? req.user.id : 'unknown')
        : 'unknown'

      payload.logger.info(
        `[PropertyPublishing] SUCCESS: Admin ${String(adminUserId)} published SellerRequest #${numericId} → Property #${newProperty.id}`,
      )

      // ── 10. Emit Domain Event (outside transaction) ────────────────────
      propertyEvents.emit('property:published', {
        property: newProperty,
        sellerRequest: updatedRequest,
        publishedBy: adminUserId,
        publishedAt: new Date().toISOString(),
      })

      return { property: newProperty, alreadyPublished: false }
    } catch (error) {
      // ── Rollback Transaction ─────────────────────────────────────────
      await killTransaction(req)

      payload.logger.error(
        `[PropertyPublishing] FAILED: SellerRequest #${numericId} — ${error instanceof Error ? error.message : 'Unknown error'}`,
      )

      throw error
    }
  }
}
