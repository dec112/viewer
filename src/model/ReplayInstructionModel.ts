import { AbstractCall, CallFactory } from "./CallModel";

export class MessageModel {
  constructor(
    private message_received_ts: string,
  ) { }

  get received(): Date {
    return new Date(this.message_received_ts);
  }
}

export class ReplayInstruction extends AbstractCall {
  constructor(
    public callId: string,
    public callerName: string,
    public callerUri: string,
    public calledUri: string,
    public created: Date,
    // this has to be preinitialized, otherwise this object would not be compatible with CallFactory
    public ended: Date = new Date(),

    public messages: Array<MessageModel> = [],
  ) {
    super(
      callId,
      callerName,
      callerUri,
      calledUri,
      created,
    );
  };

  static fromJson(json: any): ReplayInstruction {
    const call = CallFactory.fromJson(ReplayInstruction, json);

    call.ended = new Date(json.end_ts);
    call.messages = json.messages.map((x: any) => {
      const mm = new MessageModel(x.created_ts);
      return Object.assign(mm, x);
    });

    return call;
  }

  getMessagesUntil = (until: Date) => this.messages.filter(x => x.received <= until);
}
