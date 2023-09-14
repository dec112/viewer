import { Location } from "./LocationModel";
import { Call } from "./CallModel";
import { MessageState } from "../constant/MessageState";
import { Attachment } from "./Attachment";

export class Message {

    locations: Array<Location> = [];
    attachments: Array<Attachment> = [];

    constructor(
        public received: Date,
        public origin: string,
        public state: MessageState,
        public texts: Array<string> = [],
        public uris: Array<string> = [],

        public call: Call,
        public messageId?: string,
        public stateCode?: number,
        public targetUri?: string,
    ) { }

    static fromJson(json: any, call: Call, attachmentEndpointTemplate: string) {
        const message = new Message(
            new Date(json.received_ts),
            json.origin,
            MessageState.UNDEFINED,
            json.texts,
            json.uris,
            call,
        );

        if (Array.isArray(json.attachments))
            message.attachments = json.attachments.map((x: any) => Attachment.fromJson(x, attachmentEndpointTemplate, call));

        if (json.locations)
            message.locations = json.locations.map((x: any) => Location.fromJson(x, message));

        if (json.message_id)
            message.messageId = json.message_id;

        if (json.target_uri)
            message.targetUri = json.target_uri;

        return message;
    }

    static getDataFromJson(json: any): Array<any> {
        return json.data;
    }

    get text(): string {
        return this.texts.join('\r\n');
    }

    get uniqueId(): string {
        return `${this.call.callId}-${this.origin}-${this.received.getTime()}`;
    }
}
