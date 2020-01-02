export const TEXT_TOOL = 'text';
export const PEN_TOOL = 'pen';
export const LINE_TOOL = 'line';
export const RECTANGLE_TOOL = 'rectangle';
export const ELLIPSE_TOOL = 'ellipse';
export const ARROW_TOOL = 'arrow';
export const CROP_TOOL = 'crop';

export const SCALE_OPTION = 'scale';
export const COLOR_OPTION = 'color';
export const FONT_SIZE_OPTION = 'textSize';
export const LINE_SIZE_OPTION = 'lineSize';

export const TOOL_OPTIONS_MAP = {
  [TEXT_TOOL]: [COLOR_OPTION, FONT_SIZE_OPTION],
  [PEN_TOOL]: [COLOR_OPTION, LINE_SIZE_OPTION],
  [LINE_TOOL]: [COLOR_OPTION, LINE_SIZE_OPTION],
  [RECTANGLE_TOOL]: [COLOR_OPTION, LINE_SIZE_OPTION],
  [ELLIPSE_TOOL]: [COLOR_OPTION, LINE_SIZE_OPTION],
  [ARROW_TOOL]: [COLOR_OPTION, LINE_SIZE_OPTION],
  [CROP_TOOL]: [],
};
