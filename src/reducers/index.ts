import { combineReducers } from 'redux';
import localization from './localization';
import urlParameter from './urlParameter';
import call from './call';
import loginState from './loginState';
import Action from '../constant/Action';
import DebugService from '../service/DebugService';

const appReducer = combineReducers({
    localization,
    urlParameter,
    call,
    loginState,
});

const rootReducer = (state: any, action: any) => {
    // Clear all data in redux store to initial.
    if (action.type === Action.RESET_STORE) {
        state = undefined;
        DebugService.getInstance().info('redux store reset.');
    }

    return appReducer(state, action);
};

export default rootReducer;
