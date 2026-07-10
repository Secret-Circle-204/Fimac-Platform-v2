import type { CollectionSlug } from 'payload'
import type { AffectedReference } from '@/lib/media/MediaReferenceManager'

/**
 * Registry of functions that map a specific document ID to an array of Next.js cache tags.
 * This separates relationship knowledge (MediaReferenceManager) from Cache Policy.
 */
const resolvers: Partial<Record<CollectionSlug, (id: string | number) => string[]>> = {
  properties: (id) => [
    `property:${id}`,
    'featured-properties',
    'search-filters',
    'search-results',
  ],
  'blog-posts': (id) => [
    `blog:${id}`,
    'blog-posts',
  ],
  buyers: () => [], // Buyers might not have public cache tags
}

export const CacheTagResolver = {
  /**
   * Translates a list of affected entities into a deduplicated Set of cache tags.
   */
  resolveTagsForReferences: (references: AffectedReference[]): Set<string> => {
    const tags = new Set<string>()

    for (const ref of references) {
      const resolver = resolvers[ref.collection]
      if (resolver) {
        const resolvedTags = resolver(ref.id)
        resolvedTags.forEach((tag) => tags.add(tag))
      }
    }

    return tags
  },
}
