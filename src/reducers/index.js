import { combineReducers } from 'redux';
import localization from './localization';
import urlParameter from './urlParameter';
import mapData from './mapData';
import conversation from './conversation';
import basicInformation from './basicInformation';
import calls from './calls';
import loginState from './loginState';

const rootReducer = combineReducers({
    localization,
    urlParameter,
    mapData,
    conversation,
    basicInformation,
    calls,
    loginState,
});

export default rootReducer;
