import Action from '../constant/Action';

export default (state = {}, payload) => {
    switch (payload.type) {
        case Action.SET_URL_PARAMETER:
            let newState = payload.parameter;
            return newState;
        default:
            return state;
    }
};
