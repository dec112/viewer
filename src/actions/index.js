import Action from '../constant/Action';

export const setCurrentUserLanguage = currentUserLanguage => {
    return {type: Action.SET_UI_LANGUAGE, currentUserLanguage};
};

export const setUrlParameter = parameter => {
    return {type: Action.SET_URL_PARAMETER, parameter};
};

export const addLocation = locations => {
    return {type: Action.ADD_LOCATION, locations};
};

export const setMessage = messages => {
    return {type: Action.SET_MESSAGE, messages};
};

export const setData = data => {
    return {type: Action.SET_BASIC_INFORMATION, data};
};

export const addCall = currentCall => {
    return {type: Action.ADD_CALL, currentCall};
};

export const setLoggedIn = loggedIn => {
    return {type: Action.SET_LOGGED_IN, loggedIn};
};

export const setMessageState = (callId, state) =>{
    return {type: Action.UPDATE_STATE, callId, state}
};

