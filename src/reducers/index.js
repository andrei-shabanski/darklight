import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import initialized from './init';
import desk from './desk';
import user from './user';

const rootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    initialized,
    user,
    desk,
  });

export default rootReducer;
