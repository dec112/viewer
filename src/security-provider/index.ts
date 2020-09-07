export interface ISecurityProvider {
  logout(): void;
  tryRestore(): void;
  isAuthenticated(): boolean;
}