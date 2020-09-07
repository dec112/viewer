import { ISecurityProvider } from "..";
import { StorageService } from "../../service";
import { StorageKey } from "../../constant";

export class OAuthProvider implements ISecurityProvider {

  constructor(
    // uniqueTitle prevents conflicts when saving tokens to storage
    // it can happen that OAuth provider is used multiple times within the application
    public uniqueTitle: string,
    public storage: StorageService,
    public token?: string,
  ) { }
  
  getStorageKey = () => `${this.uniqueTitle}-${StorageKey.OAUTH_TOKEN}`;

  setToken (token?: string){
     this.token = token;
     this.storage.setItem(this.getStorageKey(), token);
  }
  getToken = (): string | undefined => this.token;

  logout(): void {
    this.setToken(undefined);
  }
  tryRestore(): void {
    const token = this.storage.getItem(this.getStorageKey());
    if (token)
      this.token = token;
  }
  isAuthenticated(): boolean {
    return !!this.token;
  }
}