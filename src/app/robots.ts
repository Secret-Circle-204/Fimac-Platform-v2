import type { MetadataRoute } from 'next'
import { SERVER_URL } from '@/env'

/**
 * Production Robots Configuration
 *
 * Rules:
 * - Public property pages and marketing pages: fully allowed
 * - Payload CMS admin panel: blocked (sensitive UI, no crawl value)
 * - Internal API routes: blocked (JSON endpoints, not indexable content)
 * - Next.js internal paths (_next): Next.js handles this automatically
 *
 * Sitemap reference uses SERVER_URL (resolved from NEXT_PUBLIC_SITE_URL or
 * NEXT_PUBLIC_SERVER_URL) to ensure the correct absolute URL in all environments.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',          // All internal API routes (investor, property, auth, etc.)
          '/(payload)/',    // Payload admin panel (Next.js route group)
          '/admin/',        // Payload admin alias
          '/next/',         // Any internal Next.js diagnostic or edge routes
        ],
      },
    ],
    sitemap: `${SERVER_URL}/sitemap.xml`,
  }
}
