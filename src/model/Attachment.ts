import { Call } from "./CallModel";

export class Attachment {
  constructor(
    public id: string,
    public url: string,
    public mimeType: string,
  ) { }

  static fromJson = (json: any, attachmentEndpointTemplate: string, call: Call): Attachment => {
    const id = json.attachment_id;

    return new Attachment(
      id,
      attachmentEndpointTemplate
        .replace('{call_id}', call.callId)
        .replace('{attachment_id}', id),
      json.mime_type,
    );
  }
}