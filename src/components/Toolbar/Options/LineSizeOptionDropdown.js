import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Dropdown from '../../Dropdown';
import Button from '../../Button';
import Icon from '../../Icon';
import { matchPattern } from '../../../utils/regexp';

const LINE_SIZE_VALUE_REGEXP = /^(\d{0,2})?px$/;
const LINE_SIZE_PATTERNS = [2, 5, 8, 14, 24, 36, 72];

function lineSizeToString(value) {
  return `${value}px`;
}

export default function LineSizeOptionDropdown({ lineSize, onChange }) {
  const [opened, setOpened] = useState(false);

  function handleLineSizeTexted(event) {
    event.preventDefault();

    matchPattern(event.target.value, LINE_SIZE_VALUE_REGEXP, matchedValue => {
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
        <input type="text" value={lineSizeToString(lineSize)} onChange={handleLineSizeTexted} />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <div className="dropdown-group">
          <Button variant="secondary" rounded="0" onClick={() => onChange(lineSize - 2)}>
            <Icon name="minus" />
          </Button>
          <Button variant="secondary" rounded="0" onClick={() => onChange(lineSize + 2)}>
            <Icon name="plus" />
          </Button>
        </div>
        {LINE_SIZE_PATTERNS.map(value => (
          <Button
            key={value}
            variant="secondary"
            rounded="0"
            onClick={() => onChangeAndClose(value)}
          >
            {lineSizeToString(value)}
          </Button>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}

LineSizeOptionDropdown.propTypes = {
  lineSize: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};
