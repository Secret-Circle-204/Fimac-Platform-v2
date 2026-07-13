import { unstable_cache } from "next/cache"
import { getPayloadClient } from "@/db/client"
import type { Media } from "@/payload-types"

export interface BlogPostData {
  id: string | number
  title: string
  slug: string
  excerpt: string
  featuredImage: string | Media
  publishedDate?: string | null
  author: string
  featured?: boolean | null
}

/**
 * Retrieves the latest published blog posts via cache.
 * 
 * Duration: 1 Day (86400s) — safety net only
 * Tags: 'blog-posts'
 */
export const getCachedLatestBlogPosts = async (limit: number = 4): Promise<BlogPostData[]> => {
  const cacheKey = `latest-blog-posts-v2-${limit}`

  const rawDoc = await unstable_cache(
    async () => {
      console.log(`⚡ [CACHE MISS]: latest-blog-posts-v2-${limit} (Querying PostgreSQL Remote DB...)`)
      const payload = await getPayloadClient()
      const res = await payload.find({
        collection: 'blog-posts' as never,
        where: {
          status: {
            equals: 'published',
          },
        },
        limit,
        sort: '-publishedDate',
        depth: 2,
      })
      return res.docs || []
    },
    [cacheKey],
    {
      revalidate: 86400,
      tags: ["blog-posts"],
    }
  )()

  return rawDoc as unknown as BlogPostData[]
}
