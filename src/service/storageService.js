// TypeScript const assertion (commented out)
// export const StorageType = {
//   LOCAL: 'local',
//   SESSION: 'session',
// } as const;

// JavaScript replacement
const StorageType = {
  LOCAL: 'local',
  SESSION: 'session'
};

// TypeScript union type (commented out)
// export type StorageType = (typeof StorageType)[keyof typeof StorageType]

// import { StorageType } from "../types/Storage/StorageType"

class StorageService {
  // private storage: Storage

  constructor(type = StorageType.LOCAL) {
    this.storage = type === StorageType.LOCAL ? localStorage : sessionStorage;
  }

  // set<T>(key: string, value: T): void
  set(key, value) {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);

      this.storage.setItem(key, serializedValue);
    } catch (error) {
      console.error('StorageService: Failed to set item', error);
    }
  }

  // get<T>(key: string): T | null
  get(key) {
    try {
      const value = this.storage.getItem(key);
      if (value === null) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('StorageService: Failed to get item', error);
      return null;
    }
  }

  // remove(key: string): void
  remove(key) {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error('StorageService: Failed to remove item', error);
    }
  }

  // clear(): void
  clear() {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('StorageService: Failed to clear storage', error);
    }
  }
}

// Create instances for both storage types
const localStorageService = new StorageService(StorageType.LOCAL);

const sessionStorageService = new StorageService(StorageType.SESSION);

// Default export uses localStorage
const storageService = localStorageService;

export { storageService, localStorageService, sessionStorageService, StorageType };

// Example usage (commented)
// storageService.set('user_prefs', { theme: 'dark' })
// const prefs = storageService.get('user_prefs')
