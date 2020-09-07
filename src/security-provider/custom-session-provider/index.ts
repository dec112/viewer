import { ISecurityProvider } from "..";
import { Session } from "./SessionModel";
import { StorageKey } from "../../constant";
import { StorageService } from "../../service";
import * as QueryParam from '../../constant/QueryParam';

interface ISessionObject {
  session: Session,
  sequence?: number,
};

export class CustomSessionProvider implements ISecurityProvider {
  session?: Session;
  sequence?: number;

  constructor(
    public storage: StorageService
  ) { }

  clearStorage() {
    this.storage
      .removeItem(StorageKey.SEQUENCE)
      .removeItem(StorageKey.SESSION);
  }

  saveToStorage() {
    this.storage.setJson(StorageKey.SESSION, this.session);
    if (this.sequence)
      this.storage.setJson(StorageKey.SEQUENCE, this.sequence);
  }

  getFromStorage(): ISessionObject | undefined {
    let session: Session;
    let sequence: number | undefined;

    const json = this.storage.getJson(StorageKey.SESSION);

    if (json) {
      session = Session.fromJson(json);

      const seq = this.storage.getItem(StorageKey.SEQUENCE);
      if (seq)
        sequence = parseInt(seq);

      return {
        session,
        sequence,
      }
    }
  }

  getSessionFromQueryParams(): ISessionObject | undefined {
    const params = (new URL(window.location.href)).searchParams
    const session = params.get(QueryParam.SESSION_KEY);
    const sequence = params.get(QueryParam.SESSION_SEQUENCE);

    if (session)
      return {
        // we assume this key can last forever, as border does not tell us via query param
        session: new Session(session, Number.MAX_SAFE_INTEGER),
        sequence: sequence ? parseInt(sequence) : undefined,
      };
  }

  logout() {
    this.clearStorage();
  }

  setSession(session?: Session, sequence?: number) {
    this.session = session;
    this.sequence = sequence;
    this.saveToStorage();
  }

  setSessionParts(token: string, timeout: number, sequence?: number) {
    this.setSession(new Session(
      token,
      timeout,
    ), sequence);
  }

  tryRestore() {
    const obj = this.getSessionFromQueryParams() || this.getFromStorage();

    if (obj)
      this.setSession(obj.session, obj.sequence);
  }

  isAuthenticated = () => (!!this.session && this.session.isValid());

  async generateToken(): Promise<string> {
    // we assume that session is always initialized, otherwise, this would not make sense
    const session = this.session as Session;
    const shaPromise = session.createShaToken(this.sequence);

    if (this.sequence) {
      this.sequence++;
      this.setSession(session, this.sequence);
    }

    return shaPromise;
  }

  responseSuccessful() {
    if (this.session) {
      this.session.extendValidity();
      this.saveToStorage();
    }
  }
}