import { SET_DRAWING_DESK, SET_DESK_OPTION, SET_DESK_TOOL } from '../constants/actionType';

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
  console.log(toolName)
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
