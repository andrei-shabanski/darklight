import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from './reducers';
import { initialize } from './actions/init';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

/* eslint-disable no-underscore-dangle */
const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk)),
);
/* eslint-enable */

store.dispatch(initialize());

export default store;
