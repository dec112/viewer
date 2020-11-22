export const UNDEFINED = 0;
export const NEW_CALL = 1;
export const IN_CALL = 2;
export const STALE = 3;
export const CLOSED_BY_CALLER = 4;
export const CLOSED_BY_CENTER = 5;
export const CLOSED_BY_SYSTEM = 6;
export const CLOSED = 7;
export const ERROR = 8;

export const toI18nKey = (callStateId: number) => {
  switch (callStateId) {
    case UNDEFINED: return "callState.undefined";
    case NEW_CALL: return "callState.newCall";
    case IN_CALL: return "callState.inCall";
    case STALE: return "callState.stale";
    case CLOSED_BY_CALLER: return "callState.closedByCaller";
    case CLOSED_BY_CENTER: return "callState.closedByCenter";
    case CLOSED_BY_SYSTEM:
    case CLOSED:
      return "callState.closedBySystem";
    case ERROR: return "callState.error";
    default: return "callState.undefined";
  }
}