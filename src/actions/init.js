import { INITIALIZE_APP } from '../constants/actionType';
import { setUser } from './user';
import { loadImage } from './desk/media';
import auth from '../services/auth';

export function initialize() {
  return async dispatch => {
    // restore a user session or create a tmp user
    let currentUser = await auth.getCurrentUser();
    if (!currentUser) {
      currentUser = await auth.createTemporaryUser();
    }
    dispatch(setUser(currentUser));

    // load an image
    const matchedPath = window.location.pathname.match(/\/(\w+\.png)/);
    if (matchedPath) {
      const imageId = matchedPath[1];
      dispatch(loadImage(imageId));
    }

    dispatch({
      type: INITIALIZE_APP,
    });
  };
}
