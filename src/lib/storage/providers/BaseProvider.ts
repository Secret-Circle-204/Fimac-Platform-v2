import type { Plugin } from 'payload'
import type { IStorageProvider, StorageCapabilities } from '../IStorageProvider'

/**
 * Abstract base class for all storage providers.
 * Enforces definition of capabilities and provides default error throwing
 * for unsupported operations, safeguarding the application at runtime.
 */
export abstract class BaseProvider implements IStorageProvider {
  abstract readonly name: string
  abstract readonly capabilities: StorageCapabilities

  abstract getPayloadPlugin(): Plugin | null

  // ---------------------------------------------------------------------------
  // Core Interface Implementation (Defaults)
  // ---------------------------------------------------------------------------

  async upload(_key: string, _buffer: Buffer, _mimeType?: string): Promise<void> {
    throw new Error(`[${this.name}] upload() is not implemented yet.`)
  }

  async download(_key: string): Promise<Buffer> {
    throw new Error(`[${this.name}] download() is not implemented yet.`)
  }

  async delete(_key: string): Promise<void> {
    throw new Error(`[${this.name}] delete() is not implemented yet.`)
  }

  async exists(_key: string): Promise<boolean> {
    throw new Error(`[${this.name}] exists() is not implemented yet.`)
  }

  async getPublicUrl(_key: string): Promise<string> {
    throw new Error(`[${this.name}] getPublicUrl() is not implemented yet.`)
  }

  async getSignedUrl(_key: string, _expiresInSeconds?: number): Promise<string> {
    this.assertCapability('signedUrls')
    throw new Error(`[${this.name}] getSignedUrl() is not implemented yet.`)
  }

  async copy(_sourceKey: string, _destinationKey: string): Promise<void> {
    this.assertCapability('copy')
    throw new Error(`[${this.name}] copy() is not implemented yet.`)
  }

  async move(_sourceKey: string, _destinationKey: string): Promise<void> {
    this.assertCapability('move')
    throw new Error(`[${this.name}] move() is not implemented yet.`)
  }

  async getPresignedUploadUrl(
    _key: string,
    _mimeType: string,
  ): Promise<{ url: string; fields?: Record<string, unknown> }> {
    throw new Error('getPresignedUploadUrl() must be implemented by the storage provider')
  }

  async metadata(_key: string): Promise<Record<string, unknown>> {
    throw new Error(`[${this.name}] metadata() is not implemented yet.`)
  }

  // ---------------------------------------------------------------------------
  // Utility Methods
  // ---------------------------------------------------------------------------

  /**
   * Helper to ensure a capability is supported before proceeding.
   */
  protected assertCapability(capability: keyof StorageCapabilities): void {
    if (!this.capabilities[capability]) {
      throw new Error(`[${this.name}] Provider does not support capability: ${capability}`)
    }
  }
}
