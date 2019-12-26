import { SET_STATUS } from "../constants/actionType";

export const changeStatus = text => ({
  type: SET_STATUS,
  text
});
