import { ConnectorState, ConnectorStateReason } from "../constant";
import { IConnector, IServerRequest, IServerResponse } from "./IConnector";
import { Agent, DEC112Specifics, Message, MessageFailedEvent, MessageOrigin } from "@gebsl/ng112-js/dist/browser";
import RequestMethod from "../constant/RequestMethod";

export class NG112Connector implements IConnector {
  private agent?: Agent;
  private activeConversationSubscriptions: string[] = [];

  responseListeners: Array<(response: IServerResponse, method?: string | undefined) => void> = [];

  constructor(
    public url: string,
    public protocol: string,
  ) { }

  connect = async () => { /** This is only done while logging in */ };

  close = async () => {
    this.agent?.dispose();
  };

  send = async (method: string, requestMethod: string, requestObj: IServerRequest) => {
    const { body } = requestObj;

    switch (method) {
      case RequestMethod.GET_ACTIVE_CALLS:
        const conversations = this.agent?.conversations;
        this.notifyListeners(conversations, method);
        break;
      case RequestMethod.LOGON:
        this.agent = new Agent({
          endpoint: this.url,
          user: body.user_id,
          password: body.user_password,
          domain: body.domain ?? 'dec112.test', // TODO:
          namespaceSpecifics: new DEC112Specifics(),
        });

        let res = true;
        try {
          await this.agent.initialize();
        }
        catch {
          res = false;
        }

        this.notifyListeners(res, method);
        break;
      case RequestMethod.LOGOUT:
        this.agent?.dispose().then(() => this.notifyListeners(undefined, method));
        break;
      case RequestMethod.SEND:
      case RequestMethod.CLOSE_CALL:
        const conv = this.agent?.conversations.find(x => x.id === body.call_id);
        if (!conv)
          break;

        let msg: Message;

        if (method === RequestMethod.CLOSE_CALL)
          msg = conv.stop();
        else
          msg = conv.sendMessage({
            text: body.message,
            messageId: body.tag,
          });

        if (msg) {
          try {
            await msg.promise;
            this.notifyListeners(msg, RequestMethod.NEW_MESSAGE);
          }
          catch (e) {
            this.notifyListeners({
              message: msg,
              error: e as MessageFailedEvent,
            }, RequestMethod.SEND);
          }
        }
        break;
      case RequestMethod.SUBSCRIBE_NEW_CALLS:
        this.agent?.addConversationListener((conversation) => this.notifyListeners(conversation, RequestMethod.NEW_CALL));
        break;
      case RequestMethod.SUBSCRIBE_CALL:
        const conversation = this.agent?.conversations.find(x => x.id === body.call_id)

        // don't register twice!
        if (conversation && this.activeConversationSubscriptions.indexOf(conversation.id) === -1) {
          this.activeConversationSubscriptions.push(conversation.id);
          conversation.addMessageListener((message) => {
            // notifyListeners is only called for remote messages
            // as for local messages there is a separate handling (because of possible status changes)
            if (message.origin === MessageOrigin.REMOTE)
              this.notifyListeners(message, RequestMethod.NEW_MESSAGE);
          });
          conversation.addStateListener(() => {
            this.notifyListeners(conversation, RequestMethod.STATE_CHANGE);
          });
        }
        break;
    }
  };

  addStateListener = (listener: (state: ConnectorState, reason: ConnectorStateReason, event: Event) => void) => { }; // TODO:

  addResponseListener = (listener: (response: IServerResponse, method?: string | undefined) => void) => this.responseListeners.push(listener);

  notifyListeners = (body: any, method?: string | undefined) => {
    for (const listener of this.responseListeners) {
      listener({
        body,
        headers: undefined,
      }, method);
    }
  }
}