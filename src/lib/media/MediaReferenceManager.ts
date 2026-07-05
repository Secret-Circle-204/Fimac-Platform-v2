import type { Payload, CollectionSlug } from 'payload'

export type MediaUsageResult = {
  used: boolean
  totalReferences: number
  usages: {
    collection: CollectionSlug
    count: number
    titles: string[]
  }[]
}

export type AffectedReference = {
  collection: CollectionSlug
  id: string | number
}

type ReferenceConfig = {
  collection: CollectionSlug
  field: string
  titleField: string
}

const REFERENCE_CONFIGS: ReferenceConfig[] = [
  { collection: 'blog-posts', field: 'featuredImage', titleField: 'title' },
  { collection: 'properties', field: 'photos', titleField: 'title' },
  { collection: 'investors', field: 'proof_of_funds', titleField: 'full_name' },
]

/**
 * Core Business Logic Service for managing Media references.
 * Completely independent of UI and Hooks.
 */
export const MediaReferenceManager = {
  /**
   * Checks if a given media ID is referenced by any critical collections.
   */
  isUsed: async (id: number | string, payload: Payload): Promise<MediaUsageResult> => {
    const usages: MediaUsageResult['usages'] = []
    let totalReferences = 0

    for (const config of REFERENCE_CONFIGS) {
      const result = await payload.find({
        collection: config.collection,
        where: { [config.field]: { equals: id } },
        limit: 1,
        depth: 0,
      })

      if (result.totalDocs > 0) {
        totalReferences += result.totalDocs
        usages.push({
          collection: config.collection,
          count: result.totalDocs,
          titles: result.docs.map((doc: any) => String(doc[config.titleField] || doc.id)),
        })
      }
    }

    return {
      used: totalReferences > 0,
      totalReferences,
      usages,
    }
  },

  /**
   * Retrieves all actual document IDs that reference a specific media ID.
   * Uses pagination to safely retrieve all IDs without overwhelming memory.
   */
  getAffectedReferences: async (id: number | string, payload: Payload): Promise<AffectedReference[]> => {
    const affected: AffectedReference[] = []

    for (const config of REFERENCE_CONFIGS) {
      let page = 1
      let hasNextPage = true

      while (hasNextPage) {
        const result = await payload.find({
          collection: config.collection,
          where: { [config.field]: { equals: id } },
          limit: 100, // Process in batches
          page,
          depth: 0,
          select: { id: true }, // Optimization: Only fetch the ID
        })

        if (result.docs && result.docs.length > 0) {
          result.docs.forEach((doc: any) => {
            affected.push({
              collection: config.collection,
              id: doc.id,
            })
          })
        }

        hasNextPage = result.hasNextPage
        page += 1
      }
    }

    return affected
  },
}
