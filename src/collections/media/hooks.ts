/**
 * Server-Side Media Validation & Processing Hooks
 *
 * These hooks run on the server within Payload's lifecycle.
 * They are the final authority — client-side validation is for UX only.
 *
 * Hook order:
 *   beforeValidate → beforeChange → (DB write) → afterChange
 *   beforeDelete → (DB delete) → afterDelete
 */

import type { CollectionBeforeChangeHook, CollectionBeforeValidateHook, CollectionBeforeOperationHook } from 'payload'
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_DIMENSION_PX,
  MAX_IMAGE_FILE_SIZE_BYTES,
  MIN_IMAGE_DIMENSION_PX,
  formatFileSize,
} from '@/lib/media/config'
import { MediaIdentityService } from '@/lib/media/MediaIdentityService'

// ---------------------------------------------------------------------------
// beforeOperation — Earliest interception point before Payload processes files
// ---------------------------------------------------------------------------

/**
 * Runs before ANY Payload processing occurs.
 * This is the only safe place to mutate `req.file.name` to bypass Payload's
 * native filename generation (`getSafeFilename`) which has a TOCTOU race condition.
 */
export const mediaBeforeOperation: CollectionBeforeOperationHook = async ({
  args,
  operation,
}) => {
  // Delegate physical storage identity and metadata preservation to the domain service
  return MediaIdentityService.assignIdentity(args as Record<string, unknown>, operation) as typeof args
}

// ---------------------------------------------------------------------------
// beforeValidate — Enforce file constraints before Payload validates fields
// ---------------------------------------------------------------------------

/**
 * Server-side validation of uploaded files.
 *
 * Checks:
 * 1. File size does not exceed the configured maximum
 * 2. MIME type is in the allowed list
 * 3. Image dimensions are within acceptable bounds
 *
 * Throws `ValidationError` to prevent the upload if any check fails.
 */
export const mediaBeforeValidate: CollectionBeforeValidateHook = async ({
  data,
  req,
  operation,
}) => {
  // Only validate on create/upload (not on metadata-only updates)
  if (operation !== 'create' && operation !== 'update') return data

  // `req.file` contains the uploaded file during create/update with file
  const file = req.file
  if (!file) return data

  const errors: string[] = []

  // 1. File size check
  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    errors.push(
      `File size (${formatFileSize(file.size)}) exceeds the maximum of ${formatFileSize(MAX_IMAGE_FILE_SIZE_BYTES)}.`,
    )
  }

  // 2. MIME type check
  const allowedTypes: readonly string[] = ALLOWED_IMAGE_MIME_TYPES
  if (file.mimetype && !allowedTypes.includes(file.mimetype)) {
    errors.push(
      `File type "${file.mimetype}" is not allowed. Accepted: ${allowedTypes.join(', ')}.`,
    )
  }

  // 3. Dimension checks (Payload provides width/height on the data object for images)
  const width = data?.width
  const height = data?.height
  if (typeof width === 'number' && typeof height === 'number') {
    if (width > MAX_IMAGE_DIMENSION_PX || height > MAX_IMAGE_DIMENSION_PX) {
      errors.push(
        `Image dimensions (${width}×${height}) exceed the maximum of ${MAX_IMAGE_DIMENSION_PX}×${MAX_IMAGE_DIMENSION_PX} pixels.`,
      )
    }
    if (width < MIN_IMAGE_DIMENSION_PX || height < MIN_IMAGE_DIMENSION_PX) {
      errors.push(
        `Image dimensions (${width}×${height}) are below the minimum of ${MIN_IMAGE_DIMENSION_PX}×${MIN_IMAGE_DIMENSION_PX} pixels.`,
      )
    }
  }

  if (errors.length > 0) {
    const { ValidationError } = await import('payload')
    throw new ValidationError({
      errors: errors.map((message, index) => ({
        message,
        path: index === 0 ? 'file' : `file_${index}`,
      })),
    })
  }

  return data
}

// ---------------------------------------------------------------------------
// beforeChange — Enrich metadata before database write
// ---------------------------------------------------------------------------

/**
 * Server-side logic right before the database write.
 * (Currently thin, as identity and validation are handled prior).
 */
export const mediaBeforeChange: CollectionBeforeChangeHook = async ({
  data,
}) => {
  return data
}

// ---------------------------------------------------------------------------
// beforeDelete — Final line of defense against inconsistent states
// ---------------------------------------------------------------------------

/**
 * Server-side logic right before the database delete.
 * Uses MediaReferenceManager to prevent deleting media that is currently in use.
 */
export const mediaBeforeDelete: import('payload').CollectionBeforeDeleteHook = async ({
  req,
  id,
}) => {
  const { MediaReferenceManager } = await import('@/lib/media/MediaReferenceManager')
  
  const usageResult = await MediaReferenceManager.isUsed(id, req.payload)

  if (usageResult.used) {
    const { APIError } = await import('payload')
    
    const reasonParts = usageResult.usages.map((usage) => {
      const extraCount = usage.count - 1
      const title = usage.titles[0] || 'Unknown'
      const suffix = extraCount > 0 ? ` and ${extraCount} others` : ''
      return `Used in ${usage.collection}: "${title}"${suffix}`
    })

    throw new APIError(
      `Cannot delete media. It is currently referenced. Details: ${reasonParts.join(' | ')}`,
      400,
      null,
      true
    )
  }
}

// ---------------------------------------------------------------------------
// afterChange — Domain Event: Media Modified
// ---------------------------------------------------------------------------

export const mediaAfterChange: import('payload').CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  // Smart Revalidation: Only trigger if meaningful display fields changed.
  const hasMeaningfulChange =
    !previousDoc || // It's a new document
    doc.url !== previousDoc.url ||
    doc.filename !== previousDoc.filename ||
    doc.alt !== previousDoc.alt ||
    doc.caption !== previousDoc.caption ||
    JSON.stringify(doc.sizes) !== JSON.stringify(previousDoc.sizes)

  if (!hasMeaningfulChange) {
    return doc
  }

  try {
    const { MediaReferenceManager } = await import('@/lib/media/MediaReferenceManager')
    const { CacheTagResolver } = await import('@/lib/cache/CacheTagResolver')
    const { triggerRevalidate } = await import('@/lib/cache/revalidate')

    const affectedReferences = await MediaReferenceManager.getAffectedReferences(doc.id, req.payload)
    const tagsToInvalidate = CacheTagResolver.resolveTagsForReferences(affectedReferences)

    tagsToInvalidate.forEach((tag) => {
      try {
        triggerRevalidate(tag)
        console.log(`[CacheRevalidation] Invalidated cache tag: ${tag} due to Media(${doc.id}) update.`)
      } catch (revalidateError) {
        req.payload.logger.error({ err: revalidateError }, `Failed to revalidate tag ${tag}`)
      }
    })
  } catch (err) {
    req.payload.logger.error({ err }, `Failed to broadcast mediaAfterChange domain event for Media(${doc.id})`)
  }

  return doc
}

// ---------------------------------------------------------------------------
// afterDelete — Domain Event: Media Deleted
// ---------------------------------------------------------------------------

export const mediaAfterDelete: import('payload').CollectionAfterDeleteHook = async ({
  doc,
  req,
  id,
}) => {
  // Payload sometimes only provides id, sometimes doc on deletion. We use id as source of truth.
  const mediaId = id || (doc && doc.id)
  
  if (!mediaId) return doc

  try {
    const { MediaReferenceManager } = await import('@/lib/media/MediaReferenceManager')
    const { CacheTagResolver } = await import('@/lib/cache/CacheTagResolver')
    const { triggerRevalidate } = await import('@/lib/cache/revalidate')

    const affectedReferences = await MediaReferenceManager.getAffectedReferences(mediaId, req.payload)
    const tagsToInvalidate = CacheTagResolver.resolveTagsForReferences(affectedReferences)

    tagsToInvalidate.forEach((tag) => {
      try {
        triggerRevalidate(tag)
        console.log(`[CacheRevalidation] Invalidated cache tag: ${tag} due to Media(${mediaId}) deletion.`)
      } catch (revalidateError) {
        req.payload.logger.error({ err: revalidateError }, `Failed to revalidate tag ${tag}`)
      }
    })
  } catch (err) {
    req.payload.logger.error({ err }, `Failed to broadcast mediaAfterDelete domain event for Media(${mediaId})`)
  }

  return doc
}
