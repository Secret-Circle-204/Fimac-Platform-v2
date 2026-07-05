import { permanentRedirect, notFound } from 'next/navigation'
import { local } from '@/repository'

type Params = Promise<{ routePath?: string[] }>

/**
 * Legacy Redirect Boundary
 * 
 * This catch-all route intercepts legacy property URLs (e.g., /home/state/city/street/zip/id)
 * and performs a single-hop, SEO-preserving 301 permanent redirect to the production canonical URL format.
 * 
 * Contains no UI, no metadata generation, and acts solely as a routing transition boundary.
 */
export default async function LegacyRedirectorPage({
  params,
}: {
  params: Params
}) {
  const { routePath } = await params

  // Defensive Validation: Empty or missing path segments
  if (!routePath || !Array.isArray(routePath) || routePath.length === 0) {
    notFound()
  }

  // Extract Candidate ID: Always the very last segment
  const candidateID = routePath[routePath.length - 1]

  // Validate Candidate ID structure
  if (!candidateID || typeof candidateID !== 'string' || candidateID.trim() === '') {
    notFound()
  }

  // Fetch Property using candidate ID (ID remains single source of truth)
  const property = await local.property.getByID(candidateID)

  if (!property) {
    // Handle nonexistent property safely with 404
    notFound()
  }

  // Loop Prevention & Normalization
  const decodedRoutePath = routePath.map((segment) => decodeURIComponent(segment))
  const currentNormalizedPath = `/home/${decodedRoutePath.join('/')}`

  // Guard: Prevent infinite redirect loop if current path somehow matches canonical path
  if (currentNormalizedPath === property.url) {
    return null 
  }

  // Perform single-hop 301 permanent redirect directly to absolute canonical source of truth
  // This jumps directly to /home/property/[id]/[slug]
  permanentRedirect(property.url)
}
