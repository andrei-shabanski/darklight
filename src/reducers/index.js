import { combineReducers } from 'redux';
import initialized from './init';
import desk from './desk';
import status from './status';
import user from './user';

const rootReducer = combineReducers({
  initialized,
  status,
  user,
  desk,
});

export default rootReducer;
