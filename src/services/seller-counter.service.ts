import type { Payload, PayloadRequest } from 'payload'
import { sql } from '@payloadcms/db-postgres'

export class SellerCounterService {
  /**
   * Fast O(1) increment of properties_count for a seller using direct SQL.
   */
  async increment(sellerId: number | string, req: PayloadRequest): Promise<void> {
    const numericId = Number(sellerId)
    if (!Number.isFinite(numericId)) return

    const db = req.payload.db.drizzle
    await db.execute(
      sql`UPDATE sellers SET properties_count = COALESCE(properties_count, 0) + 1 WHERE id = ${numericId}`
    )
  }

  /**
   * Fast O(1) decrement of properties_count for a seller using direct SQL.
   */
  async decrement(sellerId: number | string, req: PayloadRequest): Promise<void> {
    const numericId = Number(sellerId)
    if (!Number.isFinite(numericId)) return

    const db = req.payload.db.drizzle
    await db.execute(
      sql`UPDATE sellers SET properties_count = GREATEST(0, COALESCE(properties_count, 0) - 1) WHERE id = ${numericId}`
    )
  }

  /**
   * Resets/recalculates the exact count of properties for a seller using direct SQL COUNT.
   */
  async sync(sellerId: number | string, req: PayloadRequest | { payload: Payload }): Promise<number> {
    const numericId = Number(sellerId)
    if (!Number.isFinite(numericId)) return 0

    const db = req.payload.db.drizzle

    // Execute direct SELECT COUNT(*) query
    const result = await db.execute(
      sql`SELECT COUNT(*)::integer as count FROM properties WHERE seller_id = ${numericId}`
    )

    const actualCount = Number(result.rows?.[0]?.count ?? 0)

    // Update the counter in sellers table
    await db.execute(
      sql`UPDATE sellers SET properties_count = ${actualCount} WHERE id = ${numericId}`
    )

    return actualCount
  }

  /**
   * Resets/recalculates the exact count of properties for all sellers in the database.
   */
  async syncAll(req: PayloadRequest | { payload: Payload }): Promise<void> {
    const db = req.payload.db.drizzle

    // Update properties_count for all sellers by counting properties group by seller_id
    await db.execute(
      sql`
        UPDATE sellers s
        SET properties_count = (
          SELECT COUNT(*)::integer 
          FROM properties p 
          WHERE p.seller_id = s.id
        )
      `
    )
  }
}
