import type { IStorageProvider } from './IStorageProvider'

export class StorageRegistry {
  private static providers: Map<string, IStorageProvider> = new Map()

  /**
   * Register a new storage provider instance.
   */
  static registerProvider(name: string, provider: IStorageProvider): void {
    if (this.providers.has(name)) {
      console.warn(`[StorageRegistry] Overwriting existing provider: ${name}`)
    }
    this.providers.set(name, provider)
  }

  /**
   * Resolve an active storage provider by name.
   * Throws an error if the provider is not registered.
   */
  static resolve(name: string): IStorageProvider {
    const provider = this.providers.get(name)
    if (!provider) {
      throw new Error(`[StorageRegistry] Provider '${name}' is not registered.`)
    }
    return provider
  }

  /**
   * Returns a list of all registered provider names.
   */
  static getRegisteredProviders(): string[] {
    return Array.from(this.providers.keys())
  }
}
