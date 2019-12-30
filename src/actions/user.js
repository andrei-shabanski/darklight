import { SET_USER } from '../constants/actionType';
import auth from '../services/auth';

export function setUser(user) {
  return async dispatch => {
    dispatch({
      type: SET_USER,
      user,
    });
  };
}

export function signIn() {
  return async dispatch => {
    const currentUser = await auth.signInViaGoogle();
    dispatch(setUser(currentUser));
  };
}

export function signOut() {
  return async dispatch => {
    dispatch(setUser(null));
    await auth.signOut();
    const currentUser = await auth.createTemporaryUser();
    dispatch(setUser(currentUser));
  };
}
