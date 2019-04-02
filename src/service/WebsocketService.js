import RequestMethod from "../constant/RequestMethod";
import MessageModel from "../model/MessageModel";
import WebsocketStatus from "../constant/WebsocketStatus";
import QueryParam from '../constant/QueryParam';
import CallModel from "../model/CallModel";
import ConfigService from "../service/ConfigService";
import DebugService from "./DebugService";

class WebsocketService {
    static INSTANCE = new WebsocketService();

    static getInstance() {
        return WebsocketService.INSTANCE;
    }

    connect(apiKey) {
        const debug = DebugService.getInstance();
        
        let connectionConfig = ConfigService.getConfig().connection;
        let currentWebsocketEndpoint = connectionConfig.endpoint;
        if(apiKey){
            currentWebsocketEndpoint += `?${QueryParam.API_KEY}=${encodeURIComponent(apiKey)}`;
        }

        debug.info('Connecting to: ' + currentWebsocketEndpoint);

        this.statusListener = [];
        this.messageStateChangeListeners = [];
        this.newCallListeners = [];
        this.messageListeners = [];
        this.connection = new WebSocket(currentWebsocketEndpoint, connectionConfig.protocol);
        this.connection.onopen = () => {
            this.notifyListeners(WebsocketStatus.OPEN, this.statusListener);
        };
        this.connection.onerror = (evt) => {
            this.notifyListeners(WebsocketStatus.ERORR, this.statusListener);
        };
        this.connection.onclose = () => {
            this.notifyListeners(WebsocketStatus.CLOSED, this.statusListener);
        };
        this.connection.onmessage = (evt) => {
            var message = JSON.parse(evt.data);

            debug.log(message);

            if (message.event === RequestMethod.NEW_MESSAGE) {
                this.handleNewMessageEvent(message);
            } else if (message.method === RequestMethod.GET_CALL) {
                this.handleGetCall(message);
            } else if (message.event === RequestMethod.NEW_CALL) {
                this.handleAddCall(message);
            } else if (message.method === RequestMethod.GET_ACTIVE_CALLS) {
                this.handleGetActiveCalls(message);
            } else if (message.event === RequestMethod.STATE_CHANGE) {
                this.handleStateChange(message);
            }
        };
    }

    handleStateChange(message) {
        const changedCall = new CallModel.Builder()
            .withCallId(message.call_id)
            .withCallerUri(message.caller_uri)
            .withCallerId(message.caller_id)
            .withAlternativeCallId(message.call_id_alt)
            .withTimeReceived(message.created_ts)
            .withState(message.state).build();
        this.notifyListeners(changedCall, this.messageStateChangeListeners);
    }

    handleNewMessageEvent(message) {
        const messageModel = new MessageModel.Builder()
            .withCallId(message.call_id)
            .withCallerUri(message.caller_uri)
            .withCallerId(message.caller_id)
            .withAlternativeCallId(message.call_id_alt)
            .withData(message.message.data)
            .withLocations(message.message.locations)
            .withTexts(message.message.texts)
            .withTimeCreated(message.created_ts)
            .withOrigin(message.message.origin)
            .withTimeReceived(message.message.received_ts)
            .withDeviceId(null).build();
        this.notifyListeners(messageModel, this.messageListeners);
    }

    handleGetCall(message) {
        if (!message.call || !message.call.chat) {
            return;
        }

        let messageModels = message.call.chat.map((currentChat) =>
            new MessageModel.Builder()
            .withCallId(message.call.call_id)
            .withCallerUri(message.call.caller)
            .withCallerId(message.call.caller_id)
            .withAlternativeCallId(message.call.call_id_alt)
            .withData(currentChat.data)
            .withLocations(currentChat.locations)
            .withTexts(currentChat.texts)
            .withTimeCreated(currentChat.created_ts)
            .withOrigin(currentChat.origin)
            .withTimeReceived(currentChat.created_ts)
            .withDeviceId(message.call.device_id)
            .build()
        );

        this.notifyListeners(messageModels, this.messageListeners);
        this.handleStateChange(message.call);
    }

    handleGetActiveCalls(message) {
        for (let i = 0; i < message.calls.length; i++) {
            const newCall = new CallModel.Builder()
                .withCallId(message.calls[i].call_id)
                .withCallerUri(message.calls[i].caller_uri)
                .withCallerId(message.calls[i].caller_id)
                .withAlternativeCallId(message.calls[i].call_id_alt)
                .withTimeReceived(message.calls[i].created_ts)
                .withState(message.calls[i].state).build();
            this.subscribeCall(newCall.getCallId());
            this.notifyListeners(newCall, this.newCallListeners);
        }
    }

    handleAddCall(message) {
        const newCall = new CallModel.Builder()
            .withCallId(message.call_id)
            .withCallerId(message.caller_id)
            .withCallerUri(message.caller_uri)
            .withAlternativeCallId(message.call_id_alt)
            .withTimeReceived(message.created_ts)
            .withState(message.state).build();
        this.subscribeCall(newCall.getCallId());
        this.notifyListeners(newCall, this.newCallListeners);
    }

    subscribeCall(callId) {
        this.connection.send(JSON.stringify({
            method: RequestMethod.GET_CALL,
            call_id: callId
        }));
        this.connection.send(JSON.stringify({
            method: RequestMethod.SUBSCRIBE_CALL,
            call_id: callId
        }));
    }

    getCalls() {
        this.connection.send(JSON.stringify({
            method: RequestMethod.GET_ACTIVE_CALLS
        }));
        this.connection.send(JSON.stringify({
            method: RequestMethod.SUBSCRIBE_NEW_CALLS
        }));
    }

    send(message, callId) {
        this.connection.send(JSON.stringify({
            "method": RequestMethod.SEND,
            "call_id": callId,
            "message": message,
        }));
    }

    endCall(callId) {
        this.connection.send(JSON.stringify({
            "method": RequestMethod.CLOSE_CALL,
            "call_id": callId,
        }));
    }

    unsubscribeCall(callId) {
        this.connection.send(JSON.stringify({
            "method": RequestMethod.UNSUBSCRIBE_CALL,
            "call_id": callId,
        }));
    }

    onNewCall(listener) {
        this.addListener(listener, this.newCallListeners);
    }

    onMessageStateChange(listener) {
        this.addListener(listener, this.messageStateChangeListeners);
    }

    onMessage(listener) {
        this.addListener(listener, this.messageListeners);
    }

    onStatusChange(listener) {
        this.addListener(listener, this.statusListener);
    }

    addListener(listener, listeners) {
        if (listeners.indexOf(listener) === -1) {
            listeners.push(listener);
        }
    }

    notifyListeners(data, listeners) {
        for (var i = 0; i < listeners.length; i++) {
            listeners[i].call(this, data);
        }
    };
}

export default WebsocketService;
