import { ISecurityProvider } from "..";

export class NG112Provider implements ISecurityProvider {
  private _isAuthenticated = false;

  logout = (): void => {}
  tryRestore = (): void => {}

  isAuthenticated = (): boolean => this._isAuthenticated;
  setAuthenticated = (auth: boolean) => this._isAuthenticated = auth;
}