import Action from '../constant/Action';
import { ICallState, tryGetCallById } from './call';

export default (state: ICallState, payload: any): ICallState => {
  switch (payload.type) {
    case Action.ADD_MESSAGE:
      tryGetCallById(state, payload.callId, (call) => {
        call.messages = Array.from(call.messages);
        call.messages.push(payload.message);
      });
      break;
    default:
  }

  return state;
};
