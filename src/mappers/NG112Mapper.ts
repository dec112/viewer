import { IServerRequest, IServerResponse, RequestMethod as ServerRequestMethod } from "../connectors";
import RequestMethod from "../constant/RequestMethod";
import { ISecurityProvider } from "../security-provider";
import { Behaviour, IMapper, MessageError } from "./IMapper";
import { Conversation, ConversationState, Message, MessageFailedEvent } from "@gebsl/ng112-js/dist/browser";
import { NG112Provider } from "../security-provider/ng112-provider";
import * as CallState from "../constant/CallState";

const messageToBorderJson = (message: Message) => {
  const { vcard: vc, text, origin, dateTime } = message;

  const val: any = {
    received_ts: dateTime.getTime(),
    texts: text ? [text] : [],
    origin: origin,
    data: vc ? [{
      name: vc.getFullName(),
      tel: vc.getTelephone(),
      email: vc.getEmail(),
      adr: {
        code: vc.getCode(),
        locality: vc.getLocality(),
        street: vc.getStreet(),
      },
    }] : undefined,
  };

  if (message.location) {
    const { latitude, longitude, method, radius } = message.location;

    val.locations = [{
      lon: longitude,
      lat: latitude,
      rad: radius,
      method,
    }];
  }

  return val;
}

export class NG112Mapper implements IMapper {
  async convertRequest(method: string, requestUrl: string, request: any, securityProvider: ISecurityProvider): Promise<IServerRequest> {
    switch (method) {
      case RequestMethod.GET_CONFIG:
        return {
          behaviour: {
            behave: Behaviour.RESPONSE,
            method,
          },
          body: undefined,
          headers: undefined,
          requestMethod: ServerRequestMethod.GET,
        };
      default:
        return {
          requestMethod: ServerRequestMethod.GET,
          headers: undefined,
          behaviour: {
            behave: Behaviour.REQUEST,
            method,
          },
          body: request,
        };
    }
  }
  convertResponse(requestUrl: string, response: IServerResponse, securityProvider: ISecurityProvider, method?: string): IServerResponse {
    const { body } = response;

    let returnBody: any = body;

    switch (method) {
      case RequestMethod.LOGON:
        if (securityProvider instanceof NG112Provider)
          securityProvider.setAuthenticated(true);
        break;
      case RequestMethod.GET_ACTIVE_CALLS:
        returnBody = {
          calls: body,
        };
        break;
      case RequestMethod.NEW_CALL:
        const conv = body as Conversation;
        returnBody = {
          call_id: conv.id,
          caller_uri: conv.targetUri,
          caller_name: conv.targetUri,
          called_uri: conv.requestedUri,
          created_ts: conv.created?.getTime(),
          state: CallState.NEW_CALL,
          chat: conv.messages.map(messageToBorderJson),
        };
        break;
      case RequestMethod.SEND:
        const message = body.message as Message;
        const status = (body.error as MessageFailedEvent).response?.status_code;

        throw new MessageError(
          message.id.toString(),
          status ?? -1,
        );
      case RequestMethod.NEW_MESSAGE:
        const msg = body as Message;
        returnBody = {
          tag: msg.id,
          call_id: msg.conversation.id,
          message: messageToBorderJson(msg),
        };
        break;
      case RequestMethod.STATE_CHANGE:
        const conversation = body as Conversation;
        const conversationState = conversation.state;
        let callState = CallState.UNDEFINED;

        switch (conversationState) {
          case ConversationState.STARTED:
            callState = CallState.IN_CALL;
            break;
          case ConversationState.STOPPED:
            callState = CallState.CLOSED;
            break;
          default:
            callState = CallState.UNDEFINED;
        }

        returnBody = {
          call_id: conversation.id,
          state: callState,
        };
        break;
    }

    return {
      body: returnBody,
      headers: undefined,
      method,
    };
  }
}