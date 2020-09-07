import { sha256 } from "../../utilities/CryptoUtilities";

export class Session {
  validUntil: Date;

  constructor(public token: string, public timeout: number) {
    this.validUntil = this.extendValidity();
  }

  isValid = (): boolean => this.validUntil > new Date();

  extendValidity(): Date {
    let preferred = Date.now() + this.timeout;

    // according to js-specification these are the official bounds
    // for valid dates
    // therefore we limit it to these dates
    preferred = Math.min(preferred, 8640000000000000);
    preferred = Math.max(preferred, -8640000000000000);
    return this.validUntil = new Date(preferred);
  }

  async createShaToken(sequence?: number): Promise<string> {
    const tokenInput = sequence !== null && sequence !== undefined ?
      `${this.token}:${sequence}` :
      this.token;

    // increment sequence for next time use
    return await sha256(tokenInput);
  }

  /* is used to create a new SessionModel out of an existing one (JSON-notation) */
  static fromJson(json: {
    token: string,
    timeout: number,
    validUntil: string,
  }) {
    const session = new Session(
      json.token,
      json.timeout,
    );
    session.validUntil = new Date(json.validUntil);
    return session;
  }
}