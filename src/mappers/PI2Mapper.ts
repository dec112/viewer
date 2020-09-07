import { IMapper, Behaviour, ResponseError, ResponseErrorReason, } from "./IMapper";
import { IServerRequest, RequestMethod as ServerRequestMethod, IServerResponse } from '../connectors'
import { ISecurityProvider } from "../security-provider";
import RequestMethod from "../constant/RequestMethod";
import { OAuthProvider } from "../security-provider/oauth-provider/OAuthProvider";

const DID_RESOLVE = 'api/did/resolve';

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

const pi2Cache: Array<IServerResponse> = [];

export class PI2Mapper implements IMapper {
  async convertRequest(method: string, requestUrl: string, request: any, securityProvider: ISecurityProvider): Promise<IServerRequest> {
    const behaviour = {
      behave: Behaviour.REQUEST,
      method,
    };

    const req: IServerRequest = {
      behaviour,
      requestMethod: ServerRequestMethod.GET,
      headers: null,
      body: request,
      additionalData: request,
    };


    switch (method) {
      case RequestMethod.PI2_AUTHENTICATE:
        // while in CallReplays, we don't want to query PI2 service each time we travel in time
        // therefore we cache those responses here, means
        // if we've already queried PI2 service, we immediatley respond with the former response
        // this is tricky here, as DID resolving always includes two method calls
        // PI2_AUTHENTICATE and "RESOLVE_DID"
        const response = pi2Cache.find(x => x.additionalData.did === request.did);
        if (response) {
          behaviour.behave = Behaviour.RESPONSE;
          req.behaviour.method = RequestMethod.RESOLVE_DID;
          req.body = response.body;
          req.additionalData = response.additionalData;
        }
        else {
          behaviour.method = `oauth/token`;
          req.requestMethod = ServerRequestMethod.POST;
          req.headers = getBasicHeaders();
          req.body = {
            'client_id': request.clientId,
            'client_secret': request.clientSecret,
            'grant_type': 'client_credentials'
          };
        }
        break;
      case RequestMethod.RESOLVE_DID:
        // Random string to prevent browser caching
        behaviour.method = `${DID_RESOLVE}/${request.did}?rnd=${Date.now()}`;
        break;
      default:
    }

    if (securityProvider instanceof OAuthProvider) {
      const token = securityProvider.getToken();

      if (token) {
        req.headers = getAuthHeaders(token);
      }
    }

    return req;
  }

  convertResponse(requestUrl: string, response: IServerResponse, securityProvider: ISecurityProvider, method?: string,): IServerResponse {
    // Status can be undefined, if response is issued by mapper itself
    // e.g. in case of pi2 caching
    if (response.status !== undefined && response.status !== 200) {
      const error = response.body ? response.body.error : 'Unknown PI2 error';
      // Better use unavailable here, as PI2 service should not crash our entire application
      throw new ResponseError(ResponseErrorReason.UNAVAILABLE, `PI2: ${error}`);
    }

    const { body } = response;
    switch (method) {
      case RequestMethod.PI2_AUTHENTICATE:
        if (response.method === RequestMethod.RESOLVE_DID) {
          // we don't use response.method here, as it is overwritten in return statement
          method = RequestMethod.RESOLVE_DID;
        }
        else {
          const { access_token } = body;
          if (access_token && securityProvider instanceof OAuthProvider) {
            securityProvider.setToken(access_token);
          }
        }
        break;
      case RequestMethod.RESOLVE_DID:
        pi2Cache.push(response);
        break;
      default:
    }

    return {
      ...response,
      method,
      body: {
        ...response.body,
        ...response.additionalData
      },
    };
  }
}