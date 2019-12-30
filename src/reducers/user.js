import { SET_USER } from '../constants/actionType';

const user = (state = null, { type, user }) => {
  switch (type) {
    case SET_USER:
      return user;
    default:
      return state;
  }
};

export default user;
