import Action from '../constant/Action';
import { Message } from '../model/MessageModel';
import { ICallState, tryGetCallById } from './call';

export default (state: ICallState, payload: any): ICallState => {
  switch (payload.type) {
    case Action.ADD_OR_UPDATE_MESSAGE:
      tryGetCallById(state, payload.callId, (call) => {
        const message = payload.message as Message;
        const { messageId } = payload;

        const alreadyExisting = messageId ? call.messages.find((x) =>
          x.origin === message.origin &&
          x.messageId === messageId
        ) : undefined;

        if (alreadyExisting) {
          message.messageId = messageId;
          Object.assign(alreadyExisting, message);
        }
        else {
          call.messages = Array.from(call.messages);
          call.messages.push(payload.message);
        }
      });
      break;
    case Action.UPDATE_MESSAGE_STATE:
      const calls = state.all;
      const { state: messageState, messageId, stateCode } = payload;

      for (const call of calls) {
        const msg = call.messages.find(x => x.messageId === messageId);

        if (msg) {
          msg.state = messageState;
          if (stateCode)
            msg.stateCode = stateCode;

          break;
        }
      }
      break;
    default:
  }

  return state;
};
