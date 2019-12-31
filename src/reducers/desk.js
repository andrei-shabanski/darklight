import { SET_DRAWING_DESK, SET_DESK_OPTION, SET_DESK_TOOL } from '../constants/actionType';

const DEFAULT_STATE = {
  drawingDesk: null,
  activeTool: null,
  options: {
    color: '#ff0000',
    textSize: 14,
    lineSize: 2,
  },
};

const desk = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case SET_DRAWING_DESK:
      return { ...state, drawingDesk: action.drawingDesk };
    case SET_DESK_TOOL:
      return { ...state, activeTool: action.toolName };
    case SET_DESK_OPTION: {
      const options = {
        ...state.options,
        [action.optionName]: action.optionValue,
      };
      return { ...state, options };
    }

    default:
      return state;
  }
};

export default desk;
