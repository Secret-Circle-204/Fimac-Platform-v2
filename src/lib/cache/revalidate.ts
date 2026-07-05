import { revalidateTag } from 'next/cache'

/**
 * Triggers Next.js on-demand cache revalidation.
 * Safely bypasses execution during static build phases to avoid Next.js warnings/errors.
 */
export const triggerRevalidate = (tag: string) => {
  // Prevent executing revalidation during the static generation phase of next build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return
  }

  try {
    revalidateTag(tag)
    console.log(`[CacheRevalidation] Invalidated cache tag: ${tag}`)
  } catch (err) {
    console.error(`[CacheRevalidation] Error during revalidation for tag: ${tag}`, err)
  }
}
