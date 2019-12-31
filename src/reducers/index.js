import { combineReducers } from 'redux';

import initialized from './init';
import desk from './desk';
import user from './user';

const rootReducer = combineReducers({
  initialized,
  user,
  desk,
});

export default rootReducer;
