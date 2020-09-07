import { createStore, applyMiddleware } from 'redux';
import rootReducer from '../reducers/index.ts';
import { transactionMiddleware } from './transactionMiddleware';

// centralized application state
const store = createStore(rootReducer, applyMiddleware(
  transactionMiddleware
));

export default store;
