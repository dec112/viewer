const STORAGE_VERSION = '1';

function getStorageKey(key: string) {
  return `dec112-${STORAGE_VERSION}-${key}`;
}

export class StorageService {
  private static INSTANCE: StorageService;

  constructor(
    public storage: Storage
  ) { }

  static initialize(storage: Storage) {
    StorageService.INSTANCE = new StorageService(
      storage
    );
  }

  static getInstance() {
    return StorageService.INSTANCE;
  }

  getItem(key: string) {
    return this.storage.getItem(getStorageKey(key));
  }

  getJson(key: string) {
    const value = this.getItem(key)

    if (value)
      return JSON.parse(value);

    return undefined;
  }

  setItem(key: string, value: string | undefined) {
    if (value === undefined)
      return this.removeItem(key);

    this.storage.setItem(getStorageKey(key), value);
    return this;
  }

  setJson(key: string, value: any) {
    return this.setItem(key, JSON.stringify(value));
  }

  removeItem(key: string) {
    this.storage.removeItem(getStorageKey(key));
    return this;
  }
}
