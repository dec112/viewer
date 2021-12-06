import { Call } from "./CallModel";

export class CallReplay extends Call {
  currentTime: Date;

  constructor(
    public call: Call,
    public ended: Date,
  ) {
    super(
      call.callId,
      call.callerName,
      call.callerUri,
      call.calledUri,
      call.created,
      call.targetUri,
    );

    this.currentTime = this.created;
    Object.assign(this, call);
  }

  static fromJson(json: any, attachmentUrlTemplate: string): CallReplay {
    const replay = new CallReplay(
      Call.fromJson(json, attachmentUrlTemplate),
      new Date(json.end_ts),
    );

    return replay;
  }

  get isReplay(): boolean {
    return true;
  }
}