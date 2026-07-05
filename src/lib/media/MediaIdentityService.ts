/**
 * Media Identity Service
 * 
 * Responsible for decoupling physical storage identity from user-facing metadata.
 * Generates structured, unique storage keys that are future-proof
 * for cloud storage (S3, R2, GCS) and ensures zero filename collisions during bulk uploads.
 */

export class MediaIdentityService {
  /**
   * Generates a storage key and assigns it to the physical file name,
   * completely bypassing Payload's native TOCTOU race condition in `getSafeFilename`.
   */
  static assignIdentity(args: Record<string, unknown>, operation: string) {
    const req = args.req as { file?: { name?: string } }
    if (operation !== 'create' || !req?.file) {
      return args
    }

    const data = (args.data as Record<string, unknown>) || {}

    // 1. Preserve Original Metadata
    // Extract the original filename uploaded by the user
    const originalFilename = req.file.name || (typeof data?.originalFilename === 'string' ? data.originalFilename : null)
    data.originalFilename = originalFilename
    
    // Assign display name if not provided
    if (!data.displayName && originalFilename) {
      data.displayName = originalFilename
    }

    // 2. Generate Storage Key
    // To support nested folders in S3 in the future, this can be changed to:
    // const now = new Date()
    // const storageKey = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}`
    // For local storage, a flat UUID is safest to avoid needing to recursively create directories.
    const storageKey = crypto.randomUUID()

    data.storageKey = storageKey

    // 3. Mutate physical filename
    // Force Payload to use our Storage Key as the physical filename
    if (originalFilename) {
      const ext = originalFilename.includes('.') ? originalFilename.split('.').pop() : ''
      req.file.name = ext ? `${storageKey}.${ext}` : storageKey
    } else {
      req.file.name = storageKey
    }

    args.data = data
    return args
  }
}
