import Action from "../constant/Action";

export const addMessage = (callId, message) => ({
  type: Action.ADD_MESSAGE,
  callId,
  message,
});