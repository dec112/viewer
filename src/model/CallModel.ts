import * as CallState from "../constant/CallState";
import { Message } from "./MessageModel";
import { Location } from "./LocationModel";
import { flattenObject, sort } from "../utilities";
import * as CommonUtilities from "../utilities/CommonUtilities";
import { IdType } from "../constant";
import { DIDState } from "../constant/DIDState";
import Origin from "../constant/Origin";
import { MessageState } from "../constant/MessageState";

export class CallFactory {
    static fromJson<T extends AbstractCall>(c: new (
        callId: string,
        callerName: string,
        callerUri: string,
        calledUri: string,
        created: Date,
    ) => T, json: any): T {
        return new c(
            json.call_id,
            json.caller_name,
            json.caller_uri,
            json.called_uri,
            new Date(json.created_ts),
        );
    }
}

export abstract class AbstractCall {
    private _messageIdIncrementor = 1;

    constructor(
        public callId: string,
        public callerName: string,
        public callerUri: string,
        public calledUri: string,
        public created: Date,
    ) { }

    getNextMessageId = () => `${this.callId}-${this._messageIdIncrementor++}`;
}

export class Call extends AbstractCall {
    constructor(
        public callId: string,
        public callerName: string,
        public callerUri: string,
        public calledUri: string,
        public created: Date,
        public callIdAlt?: string,

        public callerId?: number,
        public deviceId?: string,
        public did?: string,
        public didState: DIDState = DIDState.UNRESOLVED,
        public stateId: number = CallState.UNDEFINED,
        // isInitialized is set to true, when call was fetched entirely from server
        // when using border: after get_call method was issued and call is subscribed successfully
        // when using semcon: after call details were fetched
        public isInitialized: boolean = false,
        public isTest: boolean = false,
        public messages: Array<Message> = [],
        private _data?: any,
    ) {
        super(
            callId,
            callerName,
            callerUri,
            calledUri,
            created
        );

        this.erase();
    };

    static fromJson(json: any): Call {
        const call = CallFactory.fromJson(Call, json);

        call.callIdAlt = json.call_id_alt;
        call.callerId = json.caller_id;
        call.did = json.did;
        call.stateId = json.state;
        call.isTest = json.is_test;

        switch (json.id_type) {
            case IdType.DEVICE_ID:
                call.deviceId = json.device_id; break;
            case IdType.REGISTRATION_ID:
                call.deviceId = json.reg_id; break;
        }

        if (Array.isArray(json.chat)) {
            call.messages = [];

            // sorting by received timestamp is important because we want to call `call.updateData` for each message
            // this ensures only latest data is shown to the user
            sort(json.chat, (x: any) => x.received_ts);

            for (const msg of json.chat) {
                const message = Message.fromJson(msg, call);
                if (message.origin === Origin.LOCAL)
                    message.state = MessageState.RECEIVED;

                call.messages.push(message);
                call.updateData(Message.getDataFromJson(msg));
            }
        }

        return call;
    }

    get data(): any {
        if (this._data)
            return flattenObject(this._data, false);

        return this._data;
    }

    get messageLocations(): Array<Location> {
        return this.messages.reduce((prev: Array<Location>, curr: Message) => prev.concat(curr.locations), []);
    }

    get isActive(): boolean {
        return this.stateId === CallState.NEW_CALL
            || this.stateId === CallState.IN_CALL
            || this.stateId === CallState.STALE;

    }

    get isReplay(): boolean {
        return false;
    }

    get calledService(): string {
        const match = /sip:(\w+)@/.exec(this.calledUri);

        if (match !== null)
            return match[1];

        return this.calledUri;
    }

    updateData(dataObjects: Array<any>) {
        if (!Array.isArray(dataObjects) || dataObjects.length === 0)
            return;

        this._data = dataObjects.reduce((obj: any, curr: any) => (
            CommonUtilities.deepAssign(obj, curr)
        ), this._data || {});
    }

    erase() {
        this.stateId = CallState.UNDEFINED;
        this.didState = DIDState.UNRESOLVED;
        this._data = undefined;
        this.messages = [];
    }

    stringify(): string {
        const copy = CommonUtilities.deepCopy(this);

        delete copy._messageIdIncrementor;

        for (const msg of copy.messages) {
            // delete cyclic references
            delete msg.call;

            for (const loc of msg.locations) {
                delete loc.message
            }
        }

        return JSON.stringify(copy, null, 2);
    }
}
