import { INITIALIZE_APP } from '../constants/actionType';
import { setUser } from './user';
import auth from '../services/auth';

export function initialize() {
  return async dispatch => {
    let currentUser = await auth.getCurrentUser();
    if (!currentUser) {
      currentUser = await auth.createTemporaryUser();
    }
    dispatch(setUser(currentUser));

    dispatch({
      type: INITIALIZE_APP,
    });
  };
}
