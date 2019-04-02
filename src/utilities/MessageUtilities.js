class MessageUtilities {
  static getTextMessages(messages) {
    return messages.filter((msg) => msg.getMessageText().length > 0);
  }
}

export default MessageUtilities