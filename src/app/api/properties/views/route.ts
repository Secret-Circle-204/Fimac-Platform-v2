import { NextRequest, NextResponse } from "next/server"
import { getPayloadClient } from "@/db/client"
import { sql } from "@payloadcms/db-postgres"
import { viewsMemoryCache } from "@/lib/cache/views-memory-cache"

// Parse Drizzle result rows helper
const parseRows = <T>(res: unknown): T[] => {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object' && 'rows' in res) {
    return (res as { rows: T[] }).rows
  }
  return []
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get("ids")
    if (!idsParam) {
      return NextResponse.json({ error: "Missing ids parameter" }, { status: 400 })
    }

    const ids = idsParam.split(",").map(id => id.trim()).filter(Boolean)
    if (ids.length === 0) {
      return NextResponse.json({})
    }

    const results: Record<string, number> = {}
    const idsToFetch: string[] = []

    // 1. Resolve from Memory Cache
    for (const id of ids) {
      const cachedViews = viewsMemoryCache.get(id)
      if (cachedViews !== null) {
        results[id] = cachedViews
      } else {
        idsToFetch.push(id)
      }
    }

    // 2. Fetch from Database if there are cache misses
    if (idsToFetch.length > 0) {
      const payload = await getPayloadClient()
      const db = payload.db.drizzle

      const pgArrayLiteral = `{${idsToFetch.map(id => `"${id.replace(/"/g, '\\"')}"`).join(',')}}`
      const dbResult = await db.execute(
        sql`SELECT id, views FROM properties WHERE id = ANY(${pgArrayLiteral}::text[])`
      )
      
      const rows = parseRows<{ id: string; views: number | null }>(dbResult)

      // Store in memory cache & update results
      for (const row of rows) {
        const idStr = String(row.id)
        const viewsCount = row.views || 0
        viewsMemoryCache.set(idStr, viewsCount)
        results[idStr] = viewsCount
      }

      // Handle IDs that were not found in the DB (fallback to 0)
      for (const id of idsToFetch) {
        if (results[id] === undefined) {
          viewsMemoryCache.set(id, 0)
          results[id] = 0
        }
      }
    }

    return NextResponse.json(results)
  } catch (err) {
    console.error("❌ Error in batch views API:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
