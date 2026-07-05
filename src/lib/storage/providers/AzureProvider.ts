import type { Plugin } from 'payload'
import { BaseProvider } from './BaseProvider'
import type { StorageCapabilities } from '../IStorageProvider'

export class AzureProvider extends BaseProvider {
  readonly name = 'azure'

  readonly capabilities: StorageCapabilities = {
    signedUrls: true,
    versioning: false,
    copy: true,
    move: true,
    folders: true,
    multipartUpload: true,
  }

  getPayloadPlugin(): Plugin | null {
    throw new Error(
      '[AzureProvider] @payloadcms/storage-azure is not installed. Run: pnpm add @payloadcms/storage-azure'
    )
  }
}
