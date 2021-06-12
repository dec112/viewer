import { Attachment } from "../model/Attachment";
import ConfigService from "../service/ConfigService";

export enum AttachmentType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export const getDisplayable = (attachments: Array<Attachment>, type?: AttachmentType): Array<Attachment> => {
  const allowedObj = ConfigService.get('ui', 'messageView', 'attachments', 'types');
  let allAllowed: Array<string>;

  if (type)
    allAllowed = allowedObj[type];
  else
    allAllowed = (Object.values(allowedObj) as Array<Array<string>>).reduce((prev, curr) => prev.concat(curr), []);

  const allowedRegExp = allAllowed.map((x: string) => new RegExp(x));
  return attachments.filter(val => allowedRegExp.some(allowed => allowed.test(val.mimeType)));
}