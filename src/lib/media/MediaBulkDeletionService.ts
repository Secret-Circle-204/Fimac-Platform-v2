import type { Payload } from 'payload'
import { MediaReferenceManager } from './MediaReferenceManager'

export type BulkDeletionReport = {
  deleted: number
  skipped: number
  total: number
  reasons: {
    id: string | number
    reason: string
  }[]
}

/**
 * Service for handling bulk media deletions gracefully.
 * Prevents throwing global errors for the entire batch if one image is in use.
 */
export const MediaBulkDeletionService = {
  /**
   * Processes a list of media IDs for deletion.
   * If an image is in use, it is skipped and recorded in the report.
   * Otherwise, it is deleted.
   */
  processBulkDelete: async (ids: (string | number)[], payload: Payload): Promise<BulkDeletionReport> => {
    const report: BulkDeletionReport = {
      deleted: 0,
      skipped: 0,
      total: ids.length,
      reasons: [],
    }

    for (const id of ids) {
      try {
        const usageResult = await MediaReferenceManager.isUsed(id, payload)

        if (usageResult.used) {
          // Format reason string concisely
          const reasonParts = usageResult.usages.map((usage) => {
            const extraCount = usage.count - 1
            const title = usage.titles[0] || 'Unknown'
            const suffix = extraCount > 0 ? ` and ${extraCount} others` : ''
            return `Used in ${usage.collection}: "${title}"${suffix}`
          })
          
          report.skipped++
          report.reasons.push({
            id,
            reason: reasonParts.join(' | '),
          })
        } else {
          // Safe to delete. The beforeDelete hook will also double check this.
          await payload.delete({
            collection: 'media',
            id,
            // Bypass access control for internal service operations
            overrideAccess: true, 
          })
          report.deleted++
        }
      } catch (error: unknown) {
        report.skipped++
        report.reasons.push({
          id,
          reason: `Error during deletion: ${error instanceof Error ? error.message : String(error)}`,
        })
      }
    }

    return report
  },
}
