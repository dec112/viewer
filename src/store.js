import { createStore } from 'redux';
import rootReducer from  './reducers';

// centralized application state
// const initialState = { count: 0, text: 'foo' };
// initial state is created as default value in each reducer

const initialState = {};
const store = createStore(rootReducer, initialState);

export default store;

