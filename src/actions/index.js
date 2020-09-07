import Action from '../constant/Action';

export * from './callActions';
export * from './messageActions';

export const resetStore = () => ({
    type: Action.RESET_STORE,
});

export const setCurrentUserLanguage = currentUserLanguage => {
    return {type: Action.SET_UI_LANGUAGE, currentUserLanguage};
};

export const setUrlParameter = parameter => {
    return {type: Action.SET_URL_PARAMETER, parameter};
};

export const setLoggedIn = loggedIn => {
    return {type: Action.SET_LOGGED_IN, loggedIn};
};
