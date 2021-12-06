import { addOrUpdateCall, addOrUpdateMessage, setCallState, resetStore, addOrUpdateCallReplay, timeTravel, updateData, setDIDState, updateMessageState, updateCall } from "../actions";
import RequestMethod from "../constant/RequestMethod";
import { AbstractCallWithId, Call } from "../model/CallModel";
import { Message } from "../model/MessageModel";
import { getCallById, getCallReplayById } from "../reducers/call";
import store from "../store";
import ConfigService from "./ConfigService";
import DebugService from "./DebugService";
import { ConnectorState, ConnectorStateReason } from "../constant/ConnectorState";
import { IConnector, DummyConnector, IServerResponse, RestConnector } from "../connectors";
import { IMapper, DummyMapper, Behaviour, ResponseError, ResponseErrorReason, MessageError } from "../mappers";
import { ReplayInstruction } from "../model/ReplayInstructionModel";
import { CallReplay } from "../model/CallReplayModel";
import { getConnectorByUrl, getMapperByUrl, getEndpoint, getSecurityProviderByUrl, getConnectionParameters, replaceURLParts } from "../utilities/ServerUtilities";
import { StorageService } from ".";
import { StorageKey, ServerMessage } from "../constant";
import { startTransaction, commit } from "../store/transactionMiddleware";
import { ISecurityProvider } from "../security-provider";
import { DummySecurityProvider } from "../security-provider/DummySecurityProvider";
import { ApiKeyProvider } from "../security-provider/api-key-provider";
import { PI2Mapper } from "../mappers/PI2Mapper";
import { OAuthProvider } from "../security-provider/oauth-provider/OAuthProvider";
import { DIDState } from "../constant/DIDState";
import { MessageState } from "../constant/MessageState";
import Origin from "../constant/Origin";

export interface CallUpdateProperties {
    targetUri: string;
}

class ServerService {
    static INSTANCE: ServerService;

    static initialize() {
        ServerService.INSTANCE = new ServerService();
    }

    static getInstance() {
        return ServerService.INSTANCE;
    }

    debug: DebugService;
    storage: StorageService;
    config: ConfigService;

    pi2: {
        enabled: boolean,
        connector?: RestConnector,
        mapper?: PI2Mapper,
        securityProvider?: OAuthProvider,
    };

    responseMap: Map<String, (json: any) => void>;

    constructor(
        public connection: IConnector = new DummyConnector(),
        public mapper: IMapper = new DummyMapper(),
        public securityProvider: ISecurityProvider = new DummySecurityProvider(),
    ) {
        this.debug = DebugService.getInstance();
        this.storage = StorageService.getInstance();
        this.config = ConfigService.getInstance();

        this.pi2 = {
            enabled: this.config.get('pi2', 'enabled') === true,
        };

        if (this.pi2.enabled) {
            const endpoint = getEndpoint(this.config.get('pi2', 'connection'));
            this.pi2.mapper = new PI2Mapper();
            this.pi2.connector = new RestConnector(endpoint);
            this.pi2.securityProvider = new OAuthProvider('pi2', StorageService.getInstance());
            this.pi2.connector.addResponseListener((response, method) => this.handleResponse(
                response,
                method,
                this.pi2.connector,
                this.pi2.mapper,
                this.pi2.securityProvider,
            ));
        }

        this.responseMap = new Map<String, (json: any) => void>();

        this.responseMap.set(RequestMethod.NEW_MESSAGE, this.handleNewMessage);
        this.responseMap.set(RequestMethod.NEW_CALL, this.handleNewCall);
        this.responseMap.set(RequestMethod.STATE_CHANGE, this.handleCallStateChange);
        this.responseMap.set(RequestMethod.SUBSCRIBE_CALL, this.handleSubscribeCall);
        this.responseMap.set(RequestMethod.GET_CALL, this.handleGetCall);
        this.responseMap.set(RequestMethod.GET_CALL_REPLAY, this.handleGetCallReplay);
        this.responseMap.set(RequestMethod.GET_CALL_REPLAYS, this.handleGetCallReplays);
        this.responseMap.set(RequestMethod.GET_ACTIVE_CALLS, this.handleGetActiveCalls);
        this.responseMap.set(RequestMethod.GET_CONFIG, this.handleGetConfig);
        this.responseMap.set(RequestMethod.LOGON, this.handleLogon);
        this.responseMap.set(RequestMethod.EXECUTE_TRIGGER, this.handleExecuteTrigger);
        this.responseMap.set(RequestMethod.PI2_AUTHENTICATE, this.handleAuthPi2);
        this.responseMap.set(RequestMethod.RESOLVE_DID, this.handleResolveDID);
        this.responseMap.set(RequestMethod.SEND, this.handleSend);
        this.responseMap.set(RequestMethod.UPDATE_CALL, this.handleUpdateCall);
    }

    stateListener: Array<(status: ConnectorState, event: Event) => void> = [];
    errorListener: Array<(error: ResponseError) => void> = [];
    // TODO: it's not "logged in" anymore
    // since get_config is an essential part of the application now, it should be named "initializedListeners" or so
    // because the application won't run without logging in AND getting the config
    loginListener: Array<(isAuthenticated: boolean) => void> = [];
    newCallListener: Array<(call: Call) => void> = [];
    messageListener: Array<(message: string) => void> = [];

    private chooseMapper = (endpoint: string) => this.mapper = getMapperByUrl(endpoint);
    private chooseSecurityProvider = (endpoint: string) => this.securityProvider = getSecurityProviderByUrl(endpoint);
    private chooseConnector = (endpoint: string) => {
        const connectionConfig = this.config.get('connection');
        this.connection = getConnectorByUrl(endpoint, connectionConfig.protocol);
    }

    private chooseConnectionDetails(
        endpoint: string,
    ) {
        this.chooseMapper(endpoint);
        this.chooseSecurityProvider(endpoint);
        this.chooseConnector(endpoint);
    }

    async connect(
        endpoint?: string,
        parameters?: any,
        // this is important, if tryRestoreConnection is run before
        // as this method already selects all needed details
        chooseConnectionDetails: boolean = true,
    ) {
        this.debug = DebugService.getInstance();
        // always close existing connections
        this.close();

        const connectionEndpoint = getEndpoint(endpoint, parameters);

        this.debug.info('Connecting to: ' + connectionEndpoint);

        if (chooseConnectionDetails)
            this.chooseConnectionDetails(connectionEndpoint);
        else
            this.chooseConnector(connectionEndpoint);

        this.connection.addResponseListener((response: IServerResponse, method?: string) =>
            this.handleResponse(response, method));
        this.connection.addStateListener((
            state: ConnectorState,
            reason: ConnectorStateReason,
            event: Event
        ) => this.handleConnectionStateChange(state, reason, event));

        const promise = this.connection.connect();
        promise
            .then(() => {
                this.storage
                    .setItem(StorageKey.ENDPOINT, getEndpoint(endpoint) as string);
            })
            // we need to catch the error here, otherwise we'll have an uncaught promise
            .catch(() => undefined);

        return promise;
    }

    // this is just a helper method for tryRestoreConnection
    private getEndpointHelper(useConfigEndpoint: boolean, params?: any) {
        return useConfigEndpoint ?
            getEndpoint(undefined, params) :
            this.storage.getItem(StorageKey.ENDPOINT);
    }

    private getAttachmentEndpointTemplate(): string {
        const url = new URL(this.connection.url);
        const attachmentEndpoint: string = this.config.get('connection', 'attachments', 'endpoint');

        return replaceURLParts(attachmentEndpoint, url);
    }

    async tryRestoreConnection(useConfigEndpoint: boolean = false) {
        let endpoint = this.getEndpointHelper(useConfigEndpoint);
        if (!endpoint)
            return;

        this.chooseConnectionDetails(endpoint);
        this.securityProvider.tryRestore();

        // this is a weird workaround for our api/v1
        // the problem is, we have to get that f*cking api key before connecting
        // as it has to be added to the url
        // but retreiving the api key means to having access to the security provider
        let params: any;
        if (this.securityProvider instanceof ApiKeyProvider) {
            const apiKey = this.securityProvider.getApikey();

            if (apiKey) {
                params = getConnectionParameters(apiKey, undefined);
                // TODO: Don't use this anymore, this is insecure!
                // Insecure in a way that we expose the client's API key in our config
                // This should be removed with viewer version 4
                // There is a better method of setting the client by passing "client_id" as a URL parameter
                this.setClient(apiKey);
            }
        }

        // we don't want to choose connection details anew
        await this.connect(endpoint, params, false);

        const isAuthenticated = this.securityProvider.isAuthenticated();
        if (isAuthenticated) {
            // getConfig is essential, otherwise we the application is not fully initialized (except for border v1)
            this.getConfig();
        }

        const client = this.storage.getItem(StorageKey.CLIENT);
        if (client)
            this.setClient(client);

        // keeps sessions intact
        this.startPingPong();
    }

    async send(
        method: string,
        jsonData?: any,
        connection?: IConnector,
        mapper?: IMapper,
        securityProvider?: ISecurityProvider,
    ) {
        connection = connection || this.connection;
        mapper = mapper || this.mapper;
        securityProvider = securityProvider || this.securityProvider;

        const { url } = this.connection;
        const requestObj = await mapper.convertRequest(
            method,
            url,
            jsonData,
            securityProvider
        );
        const { behaviour: { behave, method: requestMethod } } = requestObj;

        if (behave === Behaviour.DROP || requestMethod === undefined)
            // There is no method available for doing this request
            return;

        switch (behave) {
            case Behaviour.REQUEST:
                return connection.send(method, requestMethod, requestObj);
            case Behaviour.RESPONSE:
                this.handleResponse({
                    method: requestMethod,
                    status: undefined,
                    headers: undefined,
                    body: requestObj.body,
                    additionalData: requestObj.additionalData,
                },
                    method,
                    connection,
                    mapper,
                    securityProvider,
                );
                break;
            default:
                return;
        }
    }

    close() {
        if (this.connection)
            this.connection.close();
    }

    clearStorage() {
        this.storage
            .removeItem(StorageKey.CLIENT)
            .removeItem(StorageKey.ENDPOINT);
    }

    setClient(client: string) {
        this.config.setClient(client);
        this.storage.setItem(StorageKey.CLIENT, client);
    }

    logon(user: string, password: string | undefined) {
        // no login possible, if there is a valid authentication
        if (this.securityProvider.isAuthenticated())
            return;

        this.send(RequestMethod.LOGON, {
            user_id: user,
            user_password: password,
        });
        this.setClient(user);
    }

    // this is some kind of forced logout
    // we assume we can logout, without notifying the server
    clearLogin() {
        this.stopPingPong();

        this.clearStorage();
        this.securityProvider.logout();
        store.dispatch(resetStore());
    }

    async logout() {
        this.clearLogin();
        await this.send(RequestMethod.LOGOUT);
    }

    timeTravel(callId: string, progress: number) {
        // progress is a value between 0 and 1
        const state = store.getState().call;

        const instruction = getCallReplayById(state, callId);
        const replay = getCallById(state, callId) as CallReplay;
        if (!replay || !instruction)
            return;

        store.dispatch(timeTravel(callId, progress));
        const travelTo = replay.currentTime;

        store.dispatch(startTransaction());
        instruction.getMessagesUntil(travelTo)
            .forEach((message) => this.connection.notifyListeners({
                headers: undefined,
                body: JSON.stringify(message)
            }));
        store.dispatch(commit());
    }

    /**
     * `call` can be call_id or JSON call object
     */
    shouldHandleCall = (call: string | any) => {
        const isObject = typeof call === 'object';
        const shouldHandle = !isObject || this.config.get('processTestCalls') === true || !call.is_test;

        if (!shouldHandle) {
            const callId = isObject ? call.call_id : call;
            this.debug.info(`Call ${callId} is not going to be processed, as processing of test calls is disabled.`);
        }

        return shouldHandle;
    }

    handleError(error: ResponseError | Error) {
        if (error instanceof ResponseError) {
            switch (error.reason) {
                case ResponseErrorReason.NOT_FOUND:
                case ResponseErrorReason.UNAVAILABLE:
                case ResponseErrorReason.PARSING_ERROR:
                    this.notifyListeners(this.errorListener, error); break;
                case ResponseErrorReason.UNAUTHORIZED:
                    this.notifyListeners(this.errorListener, error);
                    this.clearLogin();
                    this.close();
                    break;
                default:
                    this.notifyListeners(this.errorListener, error);
                // TODO: This is the default mode for unexpected errors
                // This should be reactivated as soon as more error codes are defined
                // this.clearLogin();
                // this.close();
            }
        }
        else if (error instanceof MessageError) {
            store.dispatch(updateMessageState(
                error.messageId,
                MessageState.ERROR,
                error.errorCode,
            ));
        }

        const { message } = error;

        if (message)
            this.debug.error(message);
    }

    handleResponse = (
        response: IServerResponse,
        method?: string,
        connection?: IConnector,
        mapper?: IMapper,
        securityProvider?: ISecurityProvider,
    ) => {
        connection = connection || this.connection;
        mapper = mapper || this.mapper;
        securityProvider = securityProvider || this.securityProvider;

        let { body } = response;
        try {
            if (typeof body === 'string')
                response.body = body = JSON.parse(body);
        }
        catch (e) {
            const msg = !!body ?
                `Unable to parse JSON message: ${body}` :
                `Response body is empty.`

            this.handleError(new ResponseError(
                ResponseErrorReason.PARSING_ERROR,
                msg
            ));
        }

        this.debug.log(response);

        const { url } = connection;

        try {
            response = mapper.convertResponse(url, response, securityProvider, method);
            body = response.body;
        }
        catch (e) {
            this.handleError(e);
            return;
        }

        if (!response.method) {
            this.debug.error(`Missing response method.\n\n${JSON.stringify(response.body)}`);
            return;
        }

        const func = this.responseMap.get(response.method);
        if (func)
            func.call(this, body);
    };

    handleConnectionStateChange(state: ConnectorState, reason: ConnectorStateReason, event: Event) {
        if (state === ConnectorState.ERROR)
            this.clearLogin();

        this.notifyListeners(this.stateListener, state, reason, event);
    }

    /* METHOD and EVENT handlers */

    handleLogon(message: any) {
        // get config is tightly coupled to being authenticated
        this.getConfig();

        // keeps sessions intact
        this.startPingPong();
    }

    handleGetConfig(json: any) {
        // can be undefined, if nothing is specified on border
        // or if border version is < v2
        // or if we are connected to a semantic container
        if (json?.data) {
            this.config.setServerConfig(json.data);
        }

        // get_config informs application, whether user is logged in or not
        // as it is essential for the application
        // maybe the term "loggedIn" is not appropriate enough
        // maybe it should be "initialized"
        this.notifyListeners(this.loginListener, this.securityProvider.isAuthenticated());
    }

    handleCallStateChange(json: any) {
        const { call_id, state } = json;
        store.dispatch(setCallState(call_id, state));
    }

    handleNewMessage(json: any) {
        const { message, call_id, tag: messageId } = json;
        const call = getCallById(store.getState().call, call_id);

        if (call) {
            const messageObj = Message.fromJson(message, call, this.getAttachmentEndpointTemplate());
            // Messages that go in through handleNewMessage always are in state RECEIVED
            // either they were sent by the border automatically, or they have already be sent to the user
            messageObj.state = MessageState.RECEIVED;

            store.dispatch(addOrUpdateMessage(call_id, messageObj, messageId));
            store.dispatch(updateData(call_id, Message.getDataFromJson(message)));
        }
    }

    handleSubscribeCall(json: any) {
        // we don't use this.addOrUpdateCall here, as subscribe_call only offers the call_id
        // therefore we would not be able to update any other properties of our call
        // in fact, this would just interfere because most properties would be set to undefined
        const call = Call.fromJson(json, this.getAttachmentEndpointTemplate());
        this.getCall(call.callId);
    }

    handleGetCall(json: any) {
        // TODO:
        // if there is a "new_message" between issuing and receiving our get_call request
        // we have to be careful -> this message might not be included in our get_call response
        // maybe it's better to then issue another get_call call

        const call = this.addOrUpdateCall(json, true);
        this.authPi2AndResolveDID(call);
    }

    handleGetCallReplay(json: any) {
        this.addOrUpdateCallReplay(json, true);
    }

    handleSend(json: any) {
        // TODO: There should be a possibility to also show, when the border has received a message
        // const { tag: messageId } = json;

        // if (!messageId)
        //     return;

        // store.dispatch(updateMessageState(messageId, MessageState.INTERMIEDIARY));
    }

    handleNewCall(json: any) {
        const { call_id } = json;

        if (!this.shouldHandleCall(json))
            return;

        // TODO: Push all available info to the store, there is already an id

        let call = getCallById(store.getState().call, call_id);
        if (call && call.isReplay)
            // We don't care about new_call events    
            return;

        call = this.addOrUpdateCall(json);
        this.subscribeAndGetCall(json);
        this.notifyListeners(this.newCallListener, call);
    }

    handleGetActiveCalls(json: any) {
        json.calls.forEach((x: any) => this.subscribeAndGetCall(x));
    }

    // call replays should not automatically be subscribed -> too resource intense
    handleGetCallReplays(json: any) {
        json.forEach((x: any) => this.addOrUpdateCallReplay(x));
    }

    handleExecuteTrigger(json: any) {
        this.notifyListeners(
            this.messageListener,
            ServerMessage.TRIGGER_EXECUTED,
            { id: json.trigger_id },
        );
    }

    handleAuthPi2(json: any) {
        if (json.did) {
            this.send(RequestMethod.RESOLVE_DID, {
                did: json.did,
            }, this.pi2.connector, this.pi2.mapper, this.pi2.securityProvider);
        }
    }

    handleResolveDID(json: any) {
        const { did, data } = json;
        const calls = (store.getState().call.all as Array<Call>).filter(x => x.did === did);

        calls.forEach(call => {
            store.dispatch(updateData(call.callId, data));
            store.dispatch(setDIDState(call.callId, DIDState.RESOLVED));
        });
    }

    handleUpdateCall(json: any) {

        const call = Call.fromJson(json, this.getAttachmentEndpointTemplate());
        const updateObj: AbstractCallWithId = {
            callId: call.callId,
            // currently we only support updating targetUri
            targetUri: call.targetUri,
        }

        store.dispatch(updateCall(updateObj));
    }

    /* Functions */

    addOrUpdateCall(
        json: any,
        isInitialized: boolean = false,
    ): Call {
        const call = Call.fromJson(json, this.getAttachmentEndpointTemplate());

        if (isInitialized)
            call.isInitialized = true;

        store.dispatch(addOrUpdateCall(call));

        return call;
    }

    addOrUpdateCallReplay(
        json: any,
        isInitialized: boolean = false,
    ) {
        const replay = ReplayInstruction.fromJson(json);
        const call = CallReplay.fromJson(json, this.getAttachmentEndpointTemplate());

        if (isInitialized)
            call.isInitialized = true;

        store.dispatch(addOrUpdateCallReplay(replay));
        store.dispatch(addOrUpdateCall(call));
    }

    getConfig() {
        this.send(RequestMethod.GET_CONFIG);
    }

    getCall(callId: string) {
        if (!callId)
            return; // we can't do anything with calls without id, sorry...

        this.send(RequestMethod.GET_CALL, {
            call_id: callId,
        });
    }

    // at the moment this is only used for CallReplays as they are not fetched automatically
    // but only on demand, when the user selects a CallReplay
    // call.isInitialized prevents double fetching a call
    selectCall(callId: string) {
        this.subscribeAndGetCall(callId);
    }

    authPi2AndResolveDID(call: Call) {
        if (!call.did || call.didState === DIDState.RESOLVED)
            return;

        let newState = DIDState.CAN_NOT_RESOLVE;

        if (this.pi2.enabled) {
            const credentials = this.config.get('pi2', 'credentials');

            if (credentials) {
                const { clientId, clientSecret } = credentials;

                if (clientId && clientSecret) {
                    this.send(RequestMethod.PI2_AUTHENTICATE, {
                        did: call.did,
                        clientId,
                        clientSecret,
                    }, this.pi2.connector, this.pi2.mapper, this.pi2.securityProvider);

                    newState = DIDState.RESOLVING;
                }
            }
        }

        store.dispatch(setDIDState(call.callId, newState));
    }

    getCalls() {
        this.send(RequestMethod.GET_ACTIVE_CALLS);
    }

    /**
     * `call` can be call_id or JSON call object
     */
    subscribeAndGetCall(call: string | any) {
        const isCallObject = typeof call === 'object';
        const callId = isCallObject ? call.call_id : call;

        if (!callId) {
            this.debug.error('Can not subscribe call. No callId specified.');
            return;
        }

        if (!this.shouldHandleCall(call))
            return;

        // we do not want to fetch data or subscribe another time
        if (getCallById(store.getState().call, callId)?.isInitialized)
            return;

        this.send(RequestMethod.SUBSCRIBE_CALL, {
            call_id: callId,
        });
    }

    subscribeCalls() {
        this.send(RequestMethod.SUBSCRIBE_NEW_CALLS);
    }

    executeTrigger(triggerId: string, callId: string) {
        this.send(RequestMethod.EXECUTE_TRIGGER, {
            trigger_id: triggerId,
            call_id: callId,
        });
    }

    sendMessage(message: string, callId: string) {
        const call = getCallById(store.getState().call, callId);

        if (!call)
            return;

        const messageId = call.getNextMessageId();

        store.dispatch(addOrUpdateMessage(callId, new Message(
            new Date(),
            Origin.LOCAL,
            MessageState.SENDING,
            [message],
            call,
            messageId,
        )));

        this.send(RequestMethod.SEND, {
            tag: messageId,
            call_id: callId,
            message: message,
        });
    }

    endCall(callId: string) {
        this.send(RequestMethod.CLOSE_CALL, {
            call_id: callId,
        });
    }

    unsubscribeCall(callId: string) {
        this.send(RequestMethod.UNSUBSCRIBE_CALL, {
            call_id: callId,
        });
    }

    updateCall(callId: string, properties: CallUpdateProperties) {
        this.send(RequestMethod.UPDATE_CALL, {
            call_id: callId,
            target_uri: properties.targetUri,
        });
    }

    /* LISTENERS */

    addErrorListener = (listener: Function) => this.addListener(listener, this.errorListener);
    addStatusChangedListener = (listener: Function) => this.addListener(listener, this.stateListener);
    addLoginChangedListener = (listener: Function) => this.addListener(listener, this.loginListener);
    addNewCallListener = (listener: Function) => this.addListener(listener, this.newCallListener);
    addMessageListener = (listener: Function) => this.addListener(listener, this.messageListener);

    addListener(listener: Function, listeners: Array<Function>) {
        if (listeners.indexOf(listener) === -1) {
            listeners.push(listener);
        }
    }

    notifyListeners(listeners: Array<Function>, ...data: any) {
        for (var i = 0; i < listeners.length; i++) {
            listeners[i].apply(this, data);
        }
    };

    /** PING PONG */

    _pingPongInterval?: number;

    // keeps sessions (v2) intact
    startPingPong() {
        // don't start it twice
        if (this._pingPongInterval)
            return;

        const timeout = this.config.get('connection', 'pingPong');

        // if it's null, don't start it
        if (!timeout)
            return;

        this._pingPongInterval = window.setInterval(() => {
            // get_active_calls_count method is used for ping pong
            // as it uses least server resources amongst all available methods
            // there is no specific ping pong method in the border api
            this.send(RequestMethod.GET_ACTIVE_CALLS_COUNT);
        }, parseInt(timeout));
    }

    stopPingPong() {
        window.clearInterval(this._pingPongInterval);
        this._pingPongInterval = undefined;
    }
}

export default ServerService;
