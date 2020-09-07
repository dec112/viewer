import { IMapper, IBehaviour, Behaviour, ResponseError, ResponseErrorReason, } from "./IMapper";
import { IServerRequest, RequestMethod as ServerRequestMethod, IServerResponse } from '../connectors'
import { BorderMapper } from "./BorderMapper";
import RequestMethod from "../constant/RequestMethod";
import { ISecurityProvider } from "../security-provider";
import { OAuthProvider } from "../security-provider/oauth-provider/OAuthProvider";

const DATA = 'api/data';
const CONVERSATION = `${DATA}/conversation`;
const validResponseStatus = [
  200,
  301,
];

const getBasicHeaders = () => ({
  'Content-Type': 'application/json',
});

function getAuthHeaders(token: string) {
  return {
    ...getBasicHeaders(),
    'Accept': '*/*',
    'Authorization': `Bearer ${token}`,
  };
}

export class SemanticContainerMapper implements IMapper {

  async convertRequest(method: string, requestUrl: string, request: any, securityProvider: ISecurityProvider): Promise<IServerRequest> {
    const behaviour: IBehaviour = {
      behave: Behaviour.REQUEST,
      method: method,
    };

    switch (method) {
      case RequestMethod.GET_ACTIVE_CALLS: behaviour.method = CONVERSATION; break;
      // SUBSCRIBE_CALL is used as equivalent to GET_CALL, as there is no SUBSCRIBE_CALL for semantic containers
      // The problem here is that ServerService wants to subscribe first, before firing GET_CALL
      // But as this is not possible in this case, we basically skip subscribing the call and 
      // continue with getting the call
      // See also method "getResponseMethod" -> there, SUBSCRIBE_CALL is mapped to GET_CALL_REPLAY 
      case RequestMethod.SUBSCRIBE_CALL: behaviour.method = `${CONVERSATION}/${request.call_id}`; break;
      case RequestMethod.LOGON:
        behaviour.method = `oauth/token`;
        break;
      case RequestMethod.GET_CONFIG:
        behaviour.behave = Behaviour.RESPONSE;
        break;
      default:
        behaviour.behave = Behaviour.DROP;
    }

    // There is no payload for any request necessary
    const obj: IServerRequest = {
      behaviour,
      headers: null,
      body: null,
      requestMethod: ServerRequestMethod.GET,
    };

    switch (method) {
      case RequestMethod.LOGON:
        obj.requestMethod = ServerRequestMethod.POST;
        obj.headers = getBasicHeaders();
        obj.body = {
          'client_id': request.user_id,
          'client_secret': request.user_password,
          'grant_type': 'client_credentials'
        };
        break;
      default:
    }

    if (method !== RequestMethod.LOGON && securityProvider instanceof OAuthProvider) {
      const token = securityProvider.getToken();

      if (token) {
        obj.headers = getAuthHeaders(token);
      }
    }

    return obj;
  }

  convertResponse(requestUrl: string, response: IServerResponse, securityProvider: ISecurityProvider, method?: string): IServerResponse {
    // normally, we rely on method as our indicator
    // but if method or event is set, the messages are coming from border and therefore must be handled like this
    const { body, status } = response;
    if (body && (body.method || body.event))
      return BorderMapper.getInstance().convertResponse(requestUrl, response, securityProvider, method);

    switch (method) {
      // see "getRequestBehaviour" for explanation, why SUBSCRIBE_CALL is mapped to GET_CALL_REPLAY
      case RequestMethod.SUBSCRIBE_CALL:
        method = RequestMethod.GET_CALL_REPLAY;
        break;
      // we do not want to use normal "GET_ACTIVE_CALLS" handler within ServerService, as this would automatically subscribe all calls
      // instead, for call replays, we only want to fetch them on demand, therefore, a different RequestMethod is used
      case RequestMethod.GET_ACTIVE_CALLS:
        method = RequestMethod.GET_CALL_REPLAYS
        break;
      default:
    }

    response.method = method;

    if (status && validResponseStatus.indexOf(status) === -1) {
      let reason = ResponseErrorReason.UNEXPECTED_ERROR;

      if (status === 401)
        reason = ResponseErrorReason.UNAUTHORIZED;

      throw new ResponseError(reason);
    }

    switch (method) {
      case RequestMethod.LOGON:
        const { access_token } = body;
        if (access_token && securityProvider instanceof OAuthProvider) {
          securityProvider.setToken(access_token);
        }
        break;
      default:
    }

    return response;
  }
}