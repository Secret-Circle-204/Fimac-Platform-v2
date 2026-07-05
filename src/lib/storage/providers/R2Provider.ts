import type { Plugin } from 'payload'
// The S3 plugin handles all actual integration for S3-compatible endpoints, which R2 is.
import { s3Storage } from '@payloadcms/storage-s3'
import { BaseProvider } from './BaseProvider'
import type { StorageCapabilities } from '../IStorageProvider'
import { StorageConfig } from '../StorageConfig'

export class R2Provider extends BaseProvider {
  readonly name = 'r2'

  readonly capabilities: StorageCapabilities = {
    signedUrls: true,
    versioning: false,
    copy: true,
    move: true,
    folders: true,
    multipartUpload: true,
  }

  getPayloadPlugin(): Plugin | null {
    const config = StorageConfig.r2

    if (!config.bucket || !config.endpoint || !config.accessKeyId || !config.secretAccessKey) {
      throw new Error('[R2Provider] Missing required R2 configuration credentials.')
    }

    return s3Storage({
      collections: {
        media: true,
      },
      bucket: config.bucket,
      config: {
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
        endpoint: config.endpoint,
        region: 'auto',
        forcePathStyle: true, // Required for R2
      },
    })
  }
}
