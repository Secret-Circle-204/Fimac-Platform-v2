import type { Plugin } from 'payload'

export interface StorageCapabilities {
  readonly signedUrls: boolean
  readonly versioning: boolean
  readonly copy: boolean
  readonly move: boolean
  readonly folders: boolean
  readonly multipartUpload: boolean
}

export interface IStorageProvider {
  /**
   * The name of the provider (e.g., 'local', 's3')
   */
  readonly name: string

  /**
   * Represents the capabilities supported by this storage provider.
   */
  readonly capabilities: StorageCapabilities

  /**
   * Returns the Payload plugin associated with this provider, if applicable.
   * If the provider is handled natively by Payload (like local), this returns null.
   */
  getPayloadPlugin(): Plugin | null

  // ---------------------------------------------------------------------------
  // Core Storage Operations (Independent of Payload)
  // These are designed to support future tasks like Migration scripts,
  // Background processing, or Sync tools.
  // ---------------------------------------------------------------------------

  /**
   * Uploads a file to the storage provider.
   */
  upload(key: string, buffer: Buffer, mimeType?: string): Promise<void>

  /**
   * Downloads a file from the storage provider into a buffer.
   */
  download(key: string): Promise<Buffer>

  /**
   * Deletes a file from the storage provider.
   */
  delete(key: string): Promise<void>

  /**
   * Checks if a file exists.
   */
  exists(key: string): Promise<boolean>

  /**
   * Gets the public URL for a given file key.
   * Throws an error if public URLs are not supported or configured.
   */
  getPublicUrl(key: string): Promise<string>

  /**
   * Gets a signed URL for a given file key with a specified expiration time (in seconds).
   * Throws an error if capabilities.signedUrls is false.
   */
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>

  /**
   * Gets a signed URL for a given file key with a specified expiration time (in seconds).
   * Throws an error if capabilities.signedUrls is false.
   */
  getPresignedUploadUrl(key: string, mimeType: string): Promise<{ url: string; fields?: Record<string, unknown> }>

  /**
   * Copies a file from sourceKey to destinationKey.
   * Throws an error if capabilities.copy is false.
   */
  copy(sourceKey: string, destinationKey: string): Promise<void>

  /**
   * Moves a file from sourceKey to destinationKey.
   * Throws an error if capabilities.move is false.
   */
  move(sourceKey: string, destinationKey: string): Promise<void>

  /**
   * Retrieves metadata (size, mime type, etc) for a given file key.
   */
  metadata(key: string): Promise<Record<string, unknown>>
}
