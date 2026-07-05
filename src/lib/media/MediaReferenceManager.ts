import type { Payload } from 'payload'

export type MediaUsageResult = {
  used: boolean
  totalReferences: number
  usages: {
    collection: string
    count: number
    titles: string[]
  }[]
}

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

    // 1. Check Blog Posts
    const blogPosts = await payload.find({
      collection: 'blog-posts',
      where: { featuredImage: { equals: id } },
      limit: 1,
      depth: 0,
    })

    if (blogPosts.totalDocs > 0) {
      totalReferences += blogPosts.totalDocs
      usages.push({
        collection: 'blog-posts',
        count: blogPosts.totalDocs,
        titles: blogPosts.docs.map((doc: { title?: string; id: string | number }) => String(doc.title || doc.id)),
      })
    }

    // 2. Check Properties
    const properties = await payload.find({
      collection: 'properties',
      where: { photos: { equals: id } },
      limit: 1,
      depth: 0,
    })

    if (properties.totalDocs > 0) {
      totalReferences += properties.totalDocs
      usages.push({
        collection: 'properties',
        count: properties.totalDocs,
        titles: properties.docs.map((doc: { title?: string; id: string | number }) => String(doc.title || doc.id)),
      })
    }

    // 3. Check Investors
    const investors = await payload.find({
      collection: 'investors',
      where: { proof_of_funds: { equals: id } },
      limit: 1,
      depth: 0,
    })

    if (investors.totalDocs > 0) {
      totalReferences += investors.totalDocs
      usages.push({
        collection: 'investors',
        count: investors.totalDocs,
        titles: investors.docs.map((doc: { full_name?: string; id: string | number }) => String(doc.full_name || doc.id)),
      })
    }

    return {
      used: totalReferences > 0,
      totalReferences,
      usages,
    }
  },
}
