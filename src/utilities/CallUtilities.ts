import { Call } from "../model/CallModel";
import { LocalizationService } from "../service";
import Messages from "../i18n/Messages";


export const getCalledService = (call: Call, i18n: LocalizationService) =>
  call.calledService ||
  i18n.formatMessage(Messages.unknown);