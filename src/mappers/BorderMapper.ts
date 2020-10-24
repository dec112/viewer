import { IMapper, IBehaviour, Behaviour, ResponseError, ResponseErrorReason, } from "./IMapper";
import { IServerRequest, RequestMethod as ServerRequestMethod, IServerResponse } from '../connectors'
import RequestMethod from "../constant/RequestMethod";
import { ISecurityProvider } from "../security-provider";
import { CustomSessionProvider } from "../security-provider/custom-session-provider";
import { ApiKeyProvider } from "../security-provider/api-key-provider";
import { isApiV1 } from "../utilities";
import { LocalizationService } from "../service";
import Messages from "../i18n/Messages";

export class BorderMapper implements IMapper {
  private static INSTANCE = new BorderMapper();

  static getInstance(): BorderMapper {
    return BorderMapper.INSTANCE;
  }

  async convertRequest(method: string, requestUrl: string, request: any, securityProvider: ISecurityProvider): Promise<IServerRequest> {
    const behaviour: IBehaviour = {
      behave: Behaviour.REQUEST,
      method // They are perfectly suitable, everything is coded for WebServices :)
    };

    if (isApiV1(requestUrl)) {
      // special case if api key is used and version 1 of api is used
      // in version 1, login and logout method is not supported and will therfore be faked
      if (method === RequestMethod.LOGON || method === RequestMethod.LOGOUT)
        behaviour.behave = Behaviour.RESPONSE;
      // v1 does not support get_config
      else if (method === RequestMethod.GET_CONFIG)
        behaviour.behave = Behaviour.RESPONSE;
    }

    if (securityProvider instanceof CustomSessionProvider && securityProvider.isAuthenticated()) {
      request = {
        ...request,
        session: await securityProvider.generateToken(),
      };
    }

    request = {
      ...request,
      method,
    };

    return {
      behaviour,
      requestMethod: ServerRequestMethod.GET,
      headers: null,
      body: request,
    };
  }

  convertResponse(requestUrl: string, response: IServerResponse, securityProvider: ISecurityProvider, method?: string): IServerResponse {
    const { body } = response;
    response.method = body.method || body.event || method;

    // response code can be undefined e.g. for fake login (api/v1)
    if (body.code !== undefined && body.code !== 200) {
      let errorCode = ResponseErrorReason.UNEXPECTED_ERROR;
      let errorMessage = body.message;
      let code = parseInt(body.code);

      if (code === 404)
        errorCode = ResponseErrorReason.NOT_FOUND;
      else if (response.method === RequestMethod.SEND) {
        errorMessage = LocalizationService.getInstance().formatMessage(Messages['error.messageNotSent']);
        errorCode = ResponseErrorReason.UNAVAILABLE;
      }
      else
        errorCode = ResponseErrorReason.UNEXPECTED_ERROR;

      throw new ResponseError(errorCode, errorMessage);
    }

    if (securityProvider instanceof CustomSessionProvider)
      // necessary for extending the session  
      // each time a request is made, the session is extended at border side
      securityProvider.responseSuccessful();

    switch (response.method) {
      case RequestMethod.GET_CALL:
        return {
          ...response,
          body: body.call,
        };
      case RequestMethod.LOGON:
        // in version 1 of api, login method is not supported and will therfore be faked and always be true
        if (isApiV1(requestUrl) && securityProvider instanceof ApiKeyProvider)
          securityProvider.setKey(body.user_id);
        else if (securityProvider instanceof CustomSessionProvider) {
          const { session, timeout_ms, sequence } = body;
          securityProvider.setSessionParts(session, timeout_ms, sequence);
        }
      // else -> fall through
      default:
        return response;
    }
  }
}