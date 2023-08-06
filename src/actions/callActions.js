import Action from "../constant/Action";

export const addOrUpdateCall = call => ({
  type: Action.ADD_OR_UPDATE_CALL,
  call,
});

export const addOrUpdateCallReplay = callReplay => ({
  type: Action.ADD_OR_UPDATE_CALL_REPLAY,
  callReplay,
});

export const selectCall = call => ({
  type: Action.SELECT_CALL,
  call,
});

export const setCallState = (callId, state) => {
  return { type: Action.UPDATE_CALL_STATE, callId, state }
};

export const setCallsInitialized = (initialized) => {
  if (!initialized)
    return;

  return {
    type: Action.SET_CALLS_INITIALIZED,
    initialized: true,
  };
};

export const updateData = (callId, data, cap) => ({
  type: Action.UPDATE_DATA,
  callId,
  data,
  cap,
});

export const updateCall = (call) => ({
  type: Action.UPDATE_CALL,
  call,
})

export const setDIDState = (callId, state) => ({
  type: Action.SET_DID_STATE,
  callId,
  state,
});

export const timeTravel = (callId, progress) => ({ type: Action.TIME_TRAVEL, callId, progress });