import { StorageRegistry } from './StorageRegistry'
import { StorageConfig } from './StorageConfig'
import { LocalProvider } from './providers/LocalProvider'
import { S3Provider } from './providers/S3Provider'
import { R2Provider } from './providers/R2Provider'
import { GCSProvider } from './providers/GCSProvider'
import { AzureProvider } from './providers/AzureProvider'
import { DriveProvider } from './providers/DriveProvider'
import type { IStorageProvider } from './IStorageProvider'

// 1. Bootstrapping Phase: Register all available providers
StorageRegistry.registerProvider('local', new LocalProvider())
StorageRegistry.registerProvider('s3', new S3Provider())
StorageRegistry.registerProvider('r2', new R2Provider())
StorageRegistry.registerProvider('gcs', new GCSProvider())
StorageRegistry.registerProvider('azure', new AzureProvider())
StorageRegistry.registerProvider('drive', new DriveProvider())

// 2. Resolve the active provider based on environment configuration
export const activeProvider: IStorageProvider = StorageRegistry.resolve(StorageConfig.provider)

// 3. Re-export the interface for type safety across the app
export type { IStorageProvider } from './IStorageProvider'
