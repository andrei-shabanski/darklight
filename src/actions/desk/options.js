import {
  SET_DRAWING_DESK,
  SET_DESK_OPTION,
  SET_DESK_TOOL,
  SET_DRAWING_DESK_CONTAINER_SIZE,
  SET_DRAWING_DESK_CANVAS_SIZE,
} from '../../constants/actionType';
import {
  COLOR_OPTION,
  FONT_SIZE_OPTION,
  LINE_SIZE_OPTION,
  SCALE_OPTION,
} from '../../constants/desk';

export function setDrawingDeskContainerSize(width, height) {
  return {
    type: SET_DRAWING_DESK_CONTAINER_SIZE,
    width,
    height,
  };
}

export function setDrawingDeskCanvasSize(width, top, left) {
  return {
    type: SET_DRAWING_DESK_CANVAS_SIZE,
    width,
    top,
    left,
  };
}

export function setDrawingDesk(drawingDesk) {
  return {
    type: SET_DRAWING_DESK,
    drawingDesk,
  };
}

export function setDeskOption(optionName, optionValue) {
  return (dispatch, getState) => {
    const { desk } = getState();
    const { drawingDesk } = desk;

    if (!drawingDesk) {
      return;
    }

    // TODO: or move this code to a react component?
    drawingDesk.setOption(optionName, optionValue);

    dispatch({
      type: SET_DESK_OPTION,
      optionName,
      optionValue,
    });
  };
}

export function setDeskTool(toolName) {
  return (dispatch, getState) => {
    const { desk } = getState();
    const { drawingDesk } = desk;

    if (!drawingDesk) {
      return;
    }

    // TODO: or move this code to a react component?
    drawingDesk.selectTool(toolName);

    dispatch({
      type: SET_DESK_TOOL,
      toolName,
    });
  };
}

export function setColor(color) {
  return setDeskOption(COLOR_OPTION, color);
}

export function setFontSize(size) {
  size = Math.max(1, size);
  size = Math.min(99, size);
  return setDeskOption(FONT_SIZE_OPTION, size);
}

export function setLineSize(size) {
  size = Math.max(1, size);
  size = Math.min(99, size);
  return setDeskOption(LINE_SIZE_OPTION, size);
}

export function setScale(scale) {
  return (dispatch, getState) => {
    const state = getState();
    const { drawingDesk } = state.desk;
    const { width, height } = state.desk.container;

    if (!drawingDesk.image) {
      return;
    }

    scale = Math.max(0.1, scale);
    scale = Math.min(3, scale);

    dispatch(setDeskOption(SCALE_OPTION, scale));

    // centralizing and zooming canvases
    const canvasWidth = drawingDesk.image.width * scale;
    const canvasHeight = drawingDesk.image.height * scale;
    const canvasLeft = canvasWidth >= width ? 0 : null;
    const canvasTop = canvasHeight >= height ? 0 : null;
    dispatch(setDrawingDeskCanvasSize(canvasWidth, canvasTop, canvasLeft));
  };
}

export function fillIn() {
  return (dispatch, getState) => {
    const state = getState();
    const { drawingDesk } = state.desk;
    const { width, height } = state.desk.container;

    if (!drawingDesk.image) {
      return;
    }

    const widthScale = width / drawingDesk.image.width;
    const heightScale = height / drawingDesk.image.height;
    const scale = Math.min(widthScale, heightScale, 1);

    dispatch(setScale(scale));
  };
}
