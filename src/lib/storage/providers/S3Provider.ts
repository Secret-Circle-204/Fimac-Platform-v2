import type { Plugin } from 'payload'
// The S3 plugin handles all actual integration for S3-compatible endpoints
import { s3Storage } from '@payloadcms/storage-s3'
import { BaseProvider } from './BaseProvider'
import type { StorageCapabilities } from '../IStorageProvider'
import { StorageConfig } from '../StorageConfig'

export class S3Provider extends BaseProvider {
  readonly name = 's3'

  readonly capabilities: StorageCapabilities = {
    signedUrls: true,
    versioning: true,
    copy: true,
    move: true,
    folders: true, // Supported via object key prefixes
    multipartUpload: true,
  }

  getPayloadPlugin(): Plugin | null {
    const config = StorageConfig.s3

    if (!config.bucket || !config.accessKeyId || !config.secretAccessKey) {
      throw new Error('[S3Provider] Missing required S3 configuration credentials.')
    }

    return s3Storage({
      collections: {
        media: true, // Apply to media collection
      },
      bucket: config.bucket,
      config: {
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
        region: config.region || 'auto',
        ...(config.endpoint && { endpoint: config.endpoint }),
      },
    })
  }
}
