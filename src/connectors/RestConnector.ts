import { IConnector, IServerResponse } from "./IConnector";
import { ConnectorState, ConnectorStateReason } from "../constant/ConnectorState";
import { IServerRequest } from "../connectors";

export class RestConnector implements IConnector {
  responseListener: Array<(data: any, method: string) => void> = [];

  constructor(
    public url: string,
  ) { }

  connect = () => {
    // There is nothing to connect to with rest services
    return Promise.resolve();
  };

  // nothing to close here as well
  close = () => { };

  send = (method: string, requestMethod: string, requestObj: IServerRequest) => {
    const {
      headers,
      body,
      requestMethod: serverMethod,
      additionalData,
    } = requestObj;
    const xhr = new XMLHttpRequest();
    xhr.open(serverMethod, `${this.url}/${requestMethod}`);

    if (headers) {
      for (const head in headers) {
        xhr.setRequestHeader(head, headers[head]);
      }
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE)
        this.notifyListeners({
          method: requestMethod,
          status: xhr.status,
          headers: xhr.getAllResponseHeaders(),
          body: xhr.responseText,
          additionalData, // forwarded from request
        }, method);
    }

    xhr.send(JSON.stringify(body));
  }
  // Rest connections do not have "state", therefore we don't have to do anything here
  addStateListener = (listener: (state: ConnectorState, reason: ConnectorStateReason, event: Event) => void) => { };
  addResponseListener = (listener: (response: IServerResponse, method: string) => void) => {
    this.responseListener.push(listener);
  };

  iterateResponseListeners(response: IServerResponse, method: string) {
    this.responseListener.forEach((listener) => listener(response, method));
  }

  notifyListeners(response: IServerResponse, method?: string) {
    // method is always defined
    this.iterateResponseListeners(response, method as string);
  }
}