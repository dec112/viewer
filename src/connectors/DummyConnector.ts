import { IConnector, IServerResponse } from "./IConnector";
import { ConnectorState, ConnectorStateReason } from "../constant/ConnectorState";

export class DummyConnector implements IConnector {
  url: string = '';
  protocol?: string = '';

  connect = () => Promise.resolve();
  close = async () => { };
  send = (method: string, requestMethod: string, data: any) => { };
  addStateListener = (listener: (state: ConnectorState, reason: ConnectorStateReason, event: Event) => void) => { };
  addResponseListener = (listener: (data: any, method?: string | undefined) => void) => { };
  notifyListeners = (response: IServerResponse) => { };
}