import { ConnectorState, ConnectorStateReason } from "../constant/ConnectorState";
import { IBehaviour } from "../mappers";

export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
};

export interface IServerRequest {
  behaviour: IBehaviour,
  headers: any,
  body: any,
  requestMethod: RequestMethod,
  additionalData?: any // is used for forwarding request data to the corresponding response, used in REST connections
};

export interface IServerResponse {
  method?: string,
  status?: number,
  headers: any,
  body: any,
  additionalData?: any, // is used for forwarding request data to the corresponding response, used in REST connections
};

export interface IConnector {
  url: string;
  protocol?: string;

  connect: () => Promise<void>,
  close: () => Promise<void>,
  send: (method: string, requestMethod: string, requestObj: IServerRequest) => void,
  addStateListener: (listener: (state: ConnectorState, reason: ConnectorStateReason, event: Event) => void) => void,
  addResponseListener: (listener: (response: IServerResponse, method?: string) => void) => void,

  // necessary for time travelling
  notifyListeners: (response: IServerResponse, method?: string) => void,
}