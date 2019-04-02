import Action from '../constant/Action';
import ArrayUtilities from '../utilities/ArrayUtilities';

export default (state = {
    callId: null,
    messages: []
}, payload) => {
    let newState = {
        callId: state.callId,
        messages: state.messages.slice(0)
    };
    switch (payload.type) {
        case Action.SET_MESSAGE:
            let messages = payload.messages;
            if (!Array.isArray(messages)) {
                messages = [messages];
            }
            
            newState.messages = newState.messages.concat(payload.messages);
            if (!newState.callId) {
                newState.callId = payload.messages[0].getCallId();
            }
            break;
        case Action.UPDATE_STATE:
            if (newState.callId === payload.callId) {
                newState.state = payload.state;
            }
            break;
        default:
            return state;
    }

    // always store messages ordered
    // so they don't have to be ordered in each component
    newState.messages = ArrayUtilities.reverse(newState.messages, "timeReceived");
    return newState;
};