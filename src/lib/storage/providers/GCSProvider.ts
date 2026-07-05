import type { Plugin } from 'payload'
import { BaseProvider } from './BaseProvider'
import type { StorageCapabilities } from '../IStorageProvider'

export class GCSProvider extends BaseProvider {
  readonly name = 'gcs'

  readonly capabilities: StorageCapabilities = {
    signedUrls: true,
    versioning: true,
    copy: true,
    move: true,
    folders: true,
    multipartUpload: true,
  }

  getPayloadPlugin(): Plugin | null {
    throw new Error(
      '[GCSProvider] @payloadcms/storage-gcs is not installed. Run: pnpm add @payloadcms/storage-gcs'
    )
  }
}
