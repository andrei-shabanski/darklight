import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Dropdown from '../../Dropdown';
import Icon from '../../Icon';
import Button from '../../Button';

const COLOR_PATTERNS = [
  ['#ff0000', '#00ff00', '#0000ff'],
  ['#ffffff', '#ffff00', '#000000'],
];

export default function ColorOptionDropdown({ color, onChange }) {
  const [opened, setOpened] = useState(false);

  const colorPicker = React.createRef();
  const handleColorChanged = value => {
    onChange(value);
    setOpened(false);
  };

  return (
    <>
      <Dropdown
        className="flex-stretch"
        variant="secondary"
        rounded="0"
        opened={opened}
        onBackgroundClick={() => setOpened(false)}
      >
        <Dropdown.Toggle
          arrow={false}
          className="flex-stretch"
          variant="secondary"
          rounded="0"
          onClick={() => setOpened(!opened)}
        >
          <Icon name="rectangle" style={{ fill: color, stroke: color }} />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {COLOR_PATTERNS.map((colorLinePatterns, lineIndex) => (
            <div key={lineIndex} className="dropdown-group">
              {colorLinePatterns.map(value => (
                <Button
                  key={value}
                  variant="secondary"
                  rounded="0"
                  isActive={value === color}
                  onClick={() => handleColorChanged(value)}
                >
                  <Icon name="rectangle" style={{ fill: value, strokeWidth: 0 }} />
                </Button>
              ))}
            </div>
          ))}
          <Button
            className="picker-button"
            variant="secondary"
            rounded="0"
            onClick={() => colorPicker.current.click()}
          >
            <Icon name="rectangle" />
            Other
          </Button>
        </Dropdown.Menu>
      </Dropdown>
      <input
        ref={colorPicker}
        className="hidden"
        type="color"
        onChange={e => handleColorChanged(e.target.value)}
      />
    </>
  );
}

ColorOptionDropdown.propTypes = {
  color: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
