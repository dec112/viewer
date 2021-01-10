import { IConnector, IServerResponse } from "./IConnector";
import { ConnectorState, ConnectorStateReason } from "../constant/ConnectorState";
import { IServerRequest } from "../connectors";

export class WebsocketConnector implements IConnector {
  connection?: WebSocket;

  responseListener: Array<(data: any, method?: string) => void> = [];
  statusListener: Array<(status: ConnectorState, reason: ConnectorStateReason, event: Event) => void> = [];

  constructor(
    public url: string,
    public protocol: string,
  ) { }

  connect = async (): Promise<void> =>
    new Promise((resolve, reject) => {
      try {
        this.connection = new WebSocket(this.url, this.protocol);
        this.connection.onopen = (evt: Event) => {
          resolve();
          this.onWebsocketStatusChanged(ConnectorState.OPEN, ConnectorStateReason.EXPECTED, evt);
        }
        this.connection.onerror = (evt: Event) => {
          reject();
          this.onWebsocketStatusChanged(ConnectorState.ERROR, ConnectorStateReason.UNEXPECTED, evt);
        }
        this.connection.onclose = (evt: CloseEvent) => {
          const reason = evt.wasClean ? ConnectorStateReason.EXPECTED : ConnectorStateReason.UNEXPECTED;
          this.onWebsocketStatusChanged(ConnectorState.CLOSED, reason, evt);
        }
        this.connection.onmessage = (evt: MessageEvent) => this.onWebsocketMessage(evt);
      }
      catch (e) {
        reject(e);
      }
    });

  addStateListener(listener: (state: ConnectorState, reason: ConnectorStateReason, event: Event) => void) {
    this.statusListener.push(listener);
  }

  addResponseListener(listener: (data: any, method?: string) => void) {
    this.responseListener.push(listener);
  }

  onWebsocketStatusChanged(status: ConnectorState, reason: ConnectorStateReason, evt: Event) {
    this.statusListener.forEach((listener) => {
      listener(status, reason, evt);
    });
  }

  onWebsocketMessage(evt: MessageEvent) {
    this.notifyListeners({
      status: undefined,
      headers: undefined,
      body: evt.data,
    });
  }

  notifyListeners(response: IServerResponse, method?: string) {
    this.responseListener.forEach((listener) => {
      listener(response, method);
    });
  }

  async send(method: string, requestMethod: string, requestObj: IServerRequest) {
    if (!this.isOpen()) {
      try {
        await this.connect();
      }
      catch (e) { /* error handling is done via checking this.connection */ }
    }

    if (!this.connection)
      return;

    const { body } = requestObj;
    this.connection.send(JSON.stringify(body));
  }

  async close() {
    if (this.connection && this.isOpen())
      this.connection.close();
  }

  isOpen() {
    const ws = this.connection;
    return (ws !== undefined && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING));
  }
}