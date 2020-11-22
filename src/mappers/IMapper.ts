import { ISecurityProvider } from "../security-provider";
import { IServerRequest, IServerResponse } from "../connectors";

export enum Behaviour {
  REQUEST,
  RESPONSE,
  DROP,
};

export interface IBehaviour {
  behave: Behaviour,
  method: string | undefined,
};

export interface IMapper {
  convertRequest(method: string, requestUrl: string, request: any, securityProvider: ISecurityProvider): Promise<IServerRequest>;
  convertResponse(requestUrl: string, response: IServerResponse, securityProvider: ISecurityProvider, method?: string): IServerResponse;
}

export enum ResponseErrorReason {
  UNEXPECTED_ERROR = 'unexpected-error',
  NOT_FOUND = 'not-found',
  PARSING_ERROR = 'parsing-error',
  UNAUTHORIZED = 'unauthorized',
  UNAVAILABLE = 'unavailable',
}

export class ResponseError extends Error {
  constructor(
    public reason: ResponseErrorReason,
    public message: string = '',
  ) {
    super(message);
  }
};

export class MessageError extends Error {
  constructor(
    public messageId: string,
    public errorCode: number,
  ) {
    super(`Message error ${errorCode.toString()}`);
  }
}