import { Payload } from 'payload'
import fs from 'fs'
import path from 'path'

export const MediaHealthService = {
  /**
   * Verifies the health of a batch of media files.
   * If any file is missing from the physical storage, it updates the `healthStatus` to 'missing'.
   * This is called lazily by the UI when it detects broken images to prevent 500 errors in the future.
   */
  verifyBatchHealth: async (ids: (string | number)[], payload: Payload) => {
    if (!ids || ids.length === 0) return { checked: 0, markedMissing: 0 }

    // Fetch the media docs
    const mediaDocs = await payload.find({
      collection: 'media',
      where: { id: { in: ids } },
      limit: 1000,
      depth: 0,
    })

    let markedMissing = 0

    // Check each file's existence
    // Using staticDir configured in Media collection (e.g. 'public/media')
    const staticDir = path.resolve(process.cwd(), 'public', 'media')

    for (const doc of mediaDocs.docs) {
      if (!doc.filename || doc.healthStatus === 'missing') {
        continue // Skip if already missing or no filename
      }

      const filePath = path.join(staticDir, doc.filename)
      const exists = fs.existsSync(filePath)

      if (!exists) {
        // Mark as missing to prevent future 500 errors
        await payload.update({
          collection: 'media',
          id: doc.id,
          data: {
            healthStatus: 'missing',
          },
        })
        markedMissing++
      }
    }

    return {
      checked: mediaDocs.docs.length,
      markedMissing,
    }
  },
}
