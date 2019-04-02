import Action from '../constant/Action';

export default (state = {calls: []}, payload) => {
    let newState = {...state};
    switch (payload.type) {
        case Action.ADD_CALL:
            newState.calls.push(payload.currentCall);
            return newState;
        case Action.UPDATE_STATE:
            for (let i = 0; i < newState.calls.length; i++) {
                if (newState.calls[i].getCallId() === payload.callId) {
                    newState.calls[i].setState(payload.state)
                }
            }
            return newState;
        default:
            return state;
    }
};
