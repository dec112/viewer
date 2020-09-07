import { ISecurityProvider } from "..";
import { StorageService } from "../../service";
import { StorageKey } from "../../constant";
import * as QueryParam from '../../constant/QueryParam';

export class ApiKeyProvider implements ISecurityProvider {

  private apiKey?: string;

  constructor(
    public storage: StorageService,
  ) { }

  clear = () => this.storage.removeItem(StorageKey.API_KEY);
  save = () => this.storage.setItem(StorageKey.API_KEY, this.apiKey);
  getFromStorage = () => this.storage.getItem(StorageKey.API_KEY) || undefined;
  getFromUrl = () => (new URL(window.location.href)).searchParams.get(QueryParam.API_KEY);
  getApikey = () => this.apiKey;

  setKey(apiKey: string) {
    this.apiKey = apiKey;
    this.save();
  }
  logout() {
    this.apiKey = undefined;
    this.clear();
  }
  tryRestore(): void {
    this.apiKey = this.getFromUrl() || this.getFromStorage();
  }
  isAuthenticated = () => !!this.apiKey;
}