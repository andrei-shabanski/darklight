import {
  SET_DRAWING_DESK,
  SET_DESK_OPTION,
  SET_DESK_TOOL,
  SET_DRAWING_DESK_CONTAINER_SIZE,
  SET_DRAWING_DESK_CANVAS_SIZE,
  LOAD_IMAGE_REQUEST,
  LOAD_IMAGE_SUCCESS,
  LOAD_IMAGE_FAILURE, SAVE_IMAGE_REQUEST, SAVE_IMAGE_SUCCESS, SAVE_IMAGE_FAILURE, SET_SAVE_STATUS,
} from '../constants/actionType';
import { SAVED_STATUS } from '../constants/desk';

const DEFAULT_STATE = {
  drawingDesk: null,
  activeTool: null,
  options: {
    scale: 0.5,
    color: '#ff0000',
    textSize: 14,
    lineSize: 2,
  },
  image: {
    id: null,
    loading: false,
    saving: false,
    error: null,
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
  saveStatus: SAVED_STATUS,
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

    case SET_SAVE_STATUS: {
      return {
        ...state,
        saveStatus: action.status,
      };
    }

    case LOAD_IMAGE_REQUEST: {
      const image = {
        ...state.image,
        id: action.imageId,
        error: null,
        loading: true,
      };
      return { ...state, image };
    }
    case LOAD_IMAGE_SUCCESS: {
      const image = {
        ...state.image,
        id: action.imageId,
        error: null,
        loading: false,
      };
      return { ...state, image };
    }
    case LOAD_IMAGE_FAILURE: {
      const image = {
        ...state.image,
        id: action.imageId,
        error: action.error,
        loading: false,
      };
      return { ...state, image };
    }

    case SAVE_IMAGE_REQUEST: {
      const image = {
        ...state.image,
        error: null,
        saving: true,
      };
      return { ...state, image };
    }
    case SAVE_IMAGE_SUCCESS: {
      const image = {
        ...state.image,
        error: null,
        saving: false,
      };
      return { ...state, image };
    }
    case SAVE_IMAGE_FAILURE: {
      const image = {
        ...state.image,
        error: action.error,
        saving: false,
      };
      return { ...state, image };
    }

    default:
      return state;
  }
};

export default desk;
