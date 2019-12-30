import { INITIALIZE_APP } from '../constants/actionType';

const initialized = (state = false, { type }) => {
  switch (type) {
    case INITIALIZE_APP:
      return true;
    default:
      return state;
  }
};

export default initialized;
