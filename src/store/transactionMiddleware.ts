//@ts-ignore
import { batch } from 'react-redux'

const START_TRANSACTION = 'TRANSACTION.START';
const COMMIT_TRANSACTION = 'TRANSACTION.COMMIT';

export const transactionMiddleware = (store: any) => (next: Function) => {
  let batchedActions: Array<any> = [];
  let isTransactionActive = false;

  return (action: any) => {
    switch (action.type) {
      case START_TRANSACTION:
        isTransactionActive = true;
        return;
      case COMMIT_TRANSACTION:
        isTransactionActive = false;
        break;
      default:
    }

    if (isTransactionActive) {
      batchedActions.push(action);
    }
    // isTransactionActive is false and there are batched actions
    // means we are in COMMIT_TRANSACTION
    else if (batchedActions.length > 0) {
      // batch helps to postpone render until all actions are dispatched
      batch(() => {
        batchedActions.forEach(a => next(a));
      });
      batchedActions = [];
    }
    else {
      return next(action);
    }
  }
}

export const startTransaction = () => ({ type: START_TRANSACTION });
export const commit = () => ({ type: COMMIT_TRANSACTION });