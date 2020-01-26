import React from 'react';
import PropTypes from 'prop-types';

import LineSizeOptionDropdown from './LineSizeOptionDropdown';
import FontSizeOptionDropdown from './FontSizeOptionDropdown';
import ColorOptionDropdown from './ColorOptionDropdown';
import ScaleOptionDropdown from './ScaleOptionDropdown';
import {
  COLOR_OPTION,
  FONT_SIZE_OPTION,
  LINE_SIZE_OPTION,
  TOOL_OPTIONS_MAP,
} from '../../../constants/desk';

export default function Options({
  tool,
  scale,
  color,
  textSize,
  lineSize,
  setColor,
  setFontSize,
  setLineSize,
  setScale,
  fillIn,
}) {
  const activeOptions = tool ? TOOL_OPTIONS_MAP[tool] : [];

  const colorOptionEnabled = activeOptions.includes(COLOR_OPTION);
  const lineSizeOptionEnabled = activeOptions.includes(LINE_SIZE_OPTION);
  const fontSizeOptionEnabled = activeOptions.includes(FONT_SIZE_OPTION);

  return (
    <div className="options">
      {lineSizeOptionEnabled ? (
        <LineSizeOptionDropdown lineSize={lineSize} onChange={setLineSize} />
      ) : null}

      {fontSizeOptionEnabled ? (
        <FontSizeOptionDropdown fontSize={textSize} onChange={setFontSize} />
      ) : null}

      {colorOptionEnabled ? (
        <ColorOptionDropdown color={color} onChange={setColor} />
      ): null}

      <ScaleOptionDropdown scale={scale} onChange={setScale} onFillIn={fillIn} />
    </div>
  );
}

Options.propTypes = {
  tool: PropTypes.string.isRequired,
  scale: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  textSize: PropTypes.number.isRequired,
  lineSize: PropTypes.number.isRequired,
  setColor: PropTypes.func.isRequired,
  setFontSize: PropTypes.func.isRequired,
  setLineSize: PropTypes.func.isRequired,
  setScale: PropTypes.func.isRequired,
  fillIn: PropTypes.func.isRequired,
};
