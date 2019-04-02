import Action from '../constant/Action';

export default (state = {currentUserLanguage: 'de'}, payload) => {
    switch (payload.type) {
        case Action.SET_UI_LANGUAGE:
            let newState = {...state};
            newState.currentUserLanguage = payload.currentUserLanguage;
            return newState;
        default:
            return state;
    }
};
