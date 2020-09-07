import { ISecurityProvider } from ".";

export class DummySecurityProvider implements ISecurityProvider {
  async getRequestData(): Promise<any> {
    return undefined;
  }
  tryRestore(): boolean {
    return false;
  }
  isAuthenticated(): boolean {
    return false;
  }
  logout() { }
}