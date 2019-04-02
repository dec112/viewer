import Action from '../constant/Action';

export default (state = {loggedIn: false}, payload) => {
    switch (payload.type) {
        case Action.SET_LOGGED_IN:
            let newState = {...state};
            newState.loggedIn = payload.loggedIn;
            return newState;
        default:
            return state;
    }
};
