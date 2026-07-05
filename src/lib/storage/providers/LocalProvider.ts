import type { Plugin } from 'payload'
import { BaseProvider } from './BaseProvider'
import type { StorageCapabilities } from '../IStorageProvider'

export class LocalProvider extends BaseProvider {
  readonly name = 'local'

  readonly capabilities: StorageCapabilities = {
    signedUrls: false,
    versioning: false,
    copy: true,
    move: true,
    folders: true, // Native OS folders
    multipartUpload: false,
  }

  getPayloadPlugin(): Plugin | null {
    // Local storage is handled natively by Payload. No plugin is needed.
    return null
  }
}
