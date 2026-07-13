import { unstable_cache } from "next/cache"
import { getPayloadClient } from "@/db/client"
import type { Media } from "@/payload-types"

export interface AboutPageData {
  id?: string | number
  heroTitle: string
  heroDescription: string
  visionTitle: string
  visionText: string
  missionText: string
  visionImage?: string | Media | null
  values: {
    title: string
    description: string
    id?: string | null
  }[]
  strengthsTitle: string
  strengths: {
    strength: string
    id?: string | null
  }[]
  keysOfSuccess: {
    key: string
    id?: string | null
  }[]
  strengthsImage?: string | Media | null
  updatedAt?: string | null
  createdAt?: string | null
}

/**
 * Retrieves the AboutPage data via serialization-safe cache.
 * 
 * Duration: 1 Day (86400s) — safety net only
 * Tags: 'about-page'
 */
export const getCachedAboutPage = async (): Promise<AboutPageData | null> => {
  const cacheKey = `about-page-data-v2`

  const rawDoc = await unstable_cache(
    async () => {
      console.log(`⚡ [CACHE MISS]: about-page-data-v2 (Querying PostgreSQL Remote DB...)`)
      const payload = await getPayloadClient()
      const settings = await payload.findGlobal({
        slug: 'about-page' as never,
        depth: 2,
      })
      return settings || null
    },
    [cacheKey],
    {
      revalidate: 86400,
      tags: ["about-page"],
    }
  )()

  return rawDoc as unknown as AboutPageData | null
}
