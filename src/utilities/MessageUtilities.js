class MessageUtilities {
  static getTextMessages(messages) {
    return messages.filter((msg) => msg.text.length > 0);
  }
}

export default MessageUtilities