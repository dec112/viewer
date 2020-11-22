import Action from "../constant/Action";

export const addOrUpdateMessage = (callId, message, messageId) => ({
  type: Action.ADD_OR_UPDATE_MESSAGE,
  callId,
  message,
  messageId,
});

export const updateMessageState = (messageId, state, stateCode) => ({
  type: Action.UPDATE_MESSAGE_STATE,
  messageId,
  state,
  stateCode,
});