import { Location } from "./LocationModel";
import { Call } from "./CallModel";
import * as CallState from "../constant/CallState";

export class Message {
    constructor(
        // TODO: not defined yet
        public messageId: string,
        public received: Date,
        public origin: string,
        public stateId: number,
        public texts: Array<string> = [],

        public call: Call,
        public locations: Array<Location> = [],
    ) { }

    static fromJson(json: any, call: Call) {
        const message = new Message(
            json.message_id,
            new Date(json.received_ts),
            json.origin,
            CallState.UNDEFINED,
            json.texts,
            call,
        );

        if (json.locations)
            message.locations = json.locations.map((x: any) => Location.fromJson(x, message));

        return message;
    }

    static getDataFromJson(json: any): Array<any> {
        return json.data;
    }

    get text(): string {
        return this.texts.join('\r\n');
    }
}
