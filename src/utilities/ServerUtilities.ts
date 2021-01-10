import ConfigService from "../service/ConfigService";
import { IMapper, NG112Mapper, SemanticContainerMapper } from "../mappers";
import { IConnector, NG112Connector, RestConnector } from "../connectors";
import { API_KEY } from "../constant/QueryParam";
import { ISecurityProvider } from "../security-provider";
import { CustomSessionProvider } from "../security-provider/custom-session-provider";
import { StorageService } from "../service";
import { OAuthProvider } from "../security-provider/oauth-provider/OAuthProvider";
import { ApiKeyProvider } from "../security-provider/api-key-provider";
import Messages from "../i18n/Messages";
import { NG112Provider } from "../security-provider/ng112-provider";

function isHttp(url: string): boolean {
  return /^https?:/.test(url) && testUrl(url);
}

function isWebsocket(url: string): boolean {
  return /^ws{1,2}:/.test(url) && testUrl(url);
}

function getConfig() {
  return ConfigService.get('connection');
}

function checkApiVersion(url: string, apiVersion: string) {
  return url.indexOf(`api/${apiVersion}`) !== -1;
}

export function isApiV1(url: string): boolean {
  return checkApiVersion(url, 'v1');
}

function testUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getMapperByUrl(url: string): IMapper {
  return isWebsocket(url) ? new NG112Mapper() : new SemanticContainerMapper();
}

export function getConnectorByUrl(url: string, protocol: string): IConnector {
  return isWebsocket(url) ? new NG112Connector(url, protocol) : new RestConnector(url);
}

export function getSecurityProviderByUrl(url: string): ISecurityProvider {
  const storage = StorageService.getInstance();
  return isWebsocket(url) ?
    new NG112Provider() :
    new OAuthProvider('security-provider', storage);
}

export function getEndpoint(endpoint?: string | any, parameters?: any) {
  if (!endpoint) {
    endpoint = getConfig().endpoint;
  }

  let isSSL = window.location.protocol === 'https:';
  let endpointStr: string = '';
  // Endpoint can be a string
  if (typeof endpoint === 'string') {
    endpointStr = endpoint;
  }
  // ...or an object
  else if (typeof endpoint === 'object') {
    endpointStr = isSSL ? endpoint.ssl : endpoint.default;
  }

  const urlObj = new URL(window.location.href);
  endpointStr = endpointStr.replace('{host}', urlObj.host);
  endpointStr = endpointStr.replace('{hostname}', urlObj.hostname);

  return `${endpointStr}${getQueryString(parameters)}`;
}

export function useCredentials(endpoint?: string) {
  // we don't distinguish between api/v1 and api/v2
  // just don't tell users that for api/v1 they would not even need a password :)
  // security by not telling them -> it's something
  // https://www.massivecraft.com/wp-content/uploads/2013/08/its-something.jpg
  return true;

  // old
  // return isWebsocket(getEndpoint(endpoint));
}

export function getConnectionParameters(userName: string, password?: string) {
  if (userName && (password === '' || password === null || password === undefined)) {
    // means we have to use api_key method
    return {
      [API_KEY]: userName,
    };
  }

  return undefined;
}

export function getQueryString(parameters?: any): string {
  let queryString = '';

  if (!parameters)
    return queryString;

  queryString += '?';

  let i = 0;
  for (const par in parameters) {
    queryString += `${i > 0 ? '&' : ''}${encodeURIComponent(par)}=${encodeURIComponent(parameters[par])}`;
    i++;
  }

  return queryString;
}

export function getUsernameMessage(url: string) {
  return isWebsocket(url) ? Messages.username : Messages.appKey;
}

export function getPasswordMessage(url: string) {
  return isWebsocket(url) ? Messages.password : Messages.appSecret;
}

export function isUrlValid(url: string, includeConfig: boolean = false): boolean {
  if (includeConfig)
    url = getEndpoint(url);

  return isWebsocket(url) || isHttp(url);
}

export function isLoginPossible(url: string, userName: string, password: string, includeConfig: boolean = false) {
  if (includeConfig)
    url = getEndpoint(url);

  return isUrlValid(url) &&
    (
      isHttp(url) ||
      (isWebsocket(url) && userName)
    );
}