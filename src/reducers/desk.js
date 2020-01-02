import {
  SET_DRAWING_DESK,
  SET_DESK_OPTION,
  SET_DESK_TOOL,
  SET_DRAWING_DESK_CONTAINER_SIZE,
  SET_DRAWING_DESK_CANVAS_SIZE,
} from '../constants/actionType';

const DEFAULT_STATE = {
  drawingDesk: null,
  activeTool: null,
  options: {
    scale: 0.5,
    color: '#ff0000',
    textSize: 14,
    lineSize: 2,
  },
  container: {
    width: 0,
    height: 0,
  },
  canvases: {
    width: 0,
    left: 0,
    top: 0,
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

    case SET_DRAWING_DESK_CONTAINER_SIZE: {
      const container = {
        ...state.container,
        width: action.width,
        height: action.height,
      };
      return { ...state, container };
    }

    case SET_DRAWING_DESK_CANVAS_SIZE: {
      const canvases = {
        ...state.canvases,
        width: action.width,
        top: action.top,
        left: action.left,
      };
      return { ...state, canvases };
    }

    default:
      return state;
  }
};

export default desk;
