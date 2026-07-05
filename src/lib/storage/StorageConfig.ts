export class StorageConfig {
  static get provider(): string {
    return process.env.STORAGE_PROVIDER || 'local'
  }

  static get s3() {
    return {
      bucket: process.env.S3_BUCKET || '',
      region: process.env.S3_REGION || '',
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      endpoint: process.env.S3_ENDPOINT || '',
    }
  }

  static get r2() {
    return {
      bucket: process.env.R2_BUCKET || '',
      endpoint: process.env.R2_ENDPOINT || '',
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    }
  }

  static get gcs() {
    return {
      bucket: process.env.GCS_BUCKET || '',
      projectId: process.env.GCS_PROJECT_ID || '',
      keyFile: process.env.GCS_KEY_FILE || '',
    }
  }

  static get azure() {
    return {
      container: process.env.AZURE_CONTAINER || '',
      connectionString: process.env.AZURE_CONNECTION_STRING || '',
    }
  }

  static get drive() {
    return {
      clientId: process.env.DRIVE_CLIENT_ID || '',
      clientSecret: process.env.DRIVE_CLIENT_SECRET || '',
      refreshToken: process.env.DRIVE_REFRESH_TOKEN || '',
      folderId: process.env.DRIVE_FOLDER_ID || '',
    }
  }
}
