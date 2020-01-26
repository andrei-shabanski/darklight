import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '../../Button';
import Icon from '../../Icon';
import Dropdown from '../../Dropdown';
import { matchPattern } from '../../../utils/regexp';

const FONT_SIZE_VALUE_REGEXP = /^(\d{0,2})?px$/;
const FONT_SIZE_PATTERNS = [10, 14, 18, 24, 36, 72];

function fontSizeToString(value) {
  return `${value}px`;
}

export default function FontSizeOptionDropdown({ fontSize, onChange }) {
  const [opened, setOpened] = useState(false);

  function handleFontSizeTexted(event) {
    event.preventDefault();

    matchPattern(event.target.value, FONT_SIZE_VALUE_REGEXP, matchedValue => {
      const value = matchedValue[1];
      onChange(+value);
    });
  }

  const onChangeAndClose = value => {
    setOpened(false);
    onChange(value);
  };

  return (
    <Dropdown
      className="flex-stretch"
      variant="secondary"
      rounded="0"
      opened={opened}
      onBackgroundClick={() => setOpened(false)}
    >
      <Dropdown.Toggle onClick={() => setOpened(!opened)}>
        <input type="text" value={fontSizeToString(fontSize)} onChange={handleFontSizeTexted} />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <div className="dropdown-group">
          <Button variant="secondary" rounded="0" onClick={() => onChange(fontSize - 2)}>
            <Icon name="minus" />
          </Button>
          <Button variant="secondary" rounded="0" onClick={() => onChange(fontSize + 2)}>
            <Icon name="plus" />
          </Button>
        </div>
        {FONT_SIZE_PATTERNS.map(value => (
          <Button
            key={value}
            variant="secondary"
            rounded="0"
            onClick={() => onChangeAndClose(value)}
          >
            {fontSizeToString(value)}
          </Button>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}

FontSizeOptionDropdown.propTypes = {
  fontSize: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};
