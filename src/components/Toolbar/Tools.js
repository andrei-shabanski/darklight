import React from 'react';
import PropTypes from 'prop-types';

import Button from '../Button';
import {
  ARROW_TOOL,
  CROP_TOOL,
  ELLIPSE_TOOL,
  LINE_TOOL,
  PEN_TOOL,
  RECTANGLE_TOOL,
  TEXT_TOOL,
} from '../../constants/desk';
import Icon from '../Icon';

const TOOLS = [
  { name: TEXT_TOOL, icon: 'text' },
  { name: PEN_TOOL, icon: 'pen' },
  { name: LINE_TOOL, icon: 'line' },
  { name: RECTANGLE_TOOL, icon: 'rectangle' },
  { name: ELLIPSE_TOOL, icon: 'ellipse' },
  { name: ARROW_TOOL, icon: 'arrow' },
  { name: CROP_TOOL, icon: 'crop' },
];

export default function Tools({ activeTool, onToolChange }) {
  return (
    <div className="tools">
      {TOOLS.map(({ name, icon }) => (
        <Button
          variant="secondary"
          rounded="0"
          isActive={activeTool === name}
          onClick={() => onToolChange(name)}
        >
          <Icon name={icon} />
        </Button>
      ))}
    </div>
  );
}

Tools.propTypes = {
  activeTool: PropTypes.string.isRequired,
  onToolChange: PropTypes.func.isRequired,
};
