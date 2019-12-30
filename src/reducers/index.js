import { combineReducers } from 'redux';
import initialized from './init';
import status from './status';
import user from './user';

const rootReducer = combineReducers({
  initialized,
  status,
  user,
});

export default rootReducer;
