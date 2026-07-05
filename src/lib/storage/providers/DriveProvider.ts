import type { Plugin } from 'payload'
import { BaseProvider } from './BaseProvider'
import type { StorageCapabilities } from '../IStorageProvider'

export class DriveProvider extends BaseProvider {
  readonly name = 'drive'

  readonly capabilities: StorageCapabilities = {
    signedUrls: false, // Drive usually uses its own sharing mechanisms
    versioning: true, // Google Drive supports file versions
    copy: true,
    move: true,
    folders: true, // Uses Drive Folder IDs
    multipartUpload: true, // Supported via Google API
  }

  getPayloadPlugin(): Plugin | null {
    throw new Error(
      '[DriveProvider] A custom Google Drive Payload adapter must be implemented or installed.'
    )
  }
}
