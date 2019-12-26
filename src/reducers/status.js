import { SET_STATUS } from '../constants/actionType';

const status = (state = '', { type, text }) => {
  switch (type) {
    case SET_STATUS:
      return text;
    default:
      return state;
  }
};

export default status;
