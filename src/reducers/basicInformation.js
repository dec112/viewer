import Action from '../constant/Action';

export default (state = [], payload) => {
    switch (payload.type) {
        case Action.SET_BASIC_INFORMATION:
            return payload.data;
        default:
            return state;
    }
};
