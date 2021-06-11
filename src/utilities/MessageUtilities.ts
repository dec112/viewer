import { Message } from "../model/MessageModel";

class MessageUtilities {
  static getDisplayableMessages(messages: Array<Message>) {
    return messages.filter((msg) =>
      msg.text.length > 0 ||
      msg.attachments.length > 0
    );
  }
}

export default MessageUtilities