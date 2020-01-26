import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Dropdown from '../Dropdown';
import Button from '../Button';
import Icon from '../Icon';
import { matchPattern } from '../../utils/regexp';

const SCALE_VALUE_REGEXP = /^(\d{0,3})?%$/;
const SCALE_PATTERNS = [0.5, 1, 2];

export default function ScaleOptionDropdown({ scale, onChangeScale, onFillIn }) {
  const [opened, setOpened] = useState(false);

  const scaleToString = value => `${(value * 100) | 0}%`;

  function handleScaleTexted(event) {
    event.preventDefault();

    matchPattern(event.target.value, SCALE_VALUE_REGEXP, matchedValue => {
      const value = matchedValue[1];
      onChangeScale(+value / 100);
    });
  }

  return (
    <Dropdown
      className="flex-stretch"
      variant="secondary"
      rounded="0"
      opened={opened}
      onBackgroundClick={() => setOpened(false)}
    >
      <Dropdown.Toggle onClick={() => setOpened(!opened)}>
        <input
          type="text"
          value={scaleToString(scale)}
          onChange={handleScaleTexted}
          onClick={() => setOpened(true)}
        />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <div className="dropdown__group">
          <Button
            variant="secondary"
            rounded="0"
            data-dropdown-noclose
            onClick={() => onChangeScale(scale - 0.1)}
          >
            <Icon name="minus" />
          </Button>
          <Button variant="secondary" rounded="0" onClick={() => onFillIn()}>
            <Icon name="maximize" />
          </Button>
          <Button
            variant="secondary"
            rounded="0"
            data-dropdown-noclose
            onClick={() => onChangeScale(scale + 0.1)}
          >
            <Icon name="plus" />
          </Button>
        </div>
        {SCALE_PATTERNS.map(value => (
          <Button key={value} variant="secondary" rounded="0" onClick={() => onChangeScale(value)}>
            {scaleToString(value)}
          </Button>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}

ScaleOptionDropdown.propsType = {
  scale: PropTypes.number.isRequired,
  onScaleChange: PropTypes.func.isRequired,
  onFillIn: PropTypes.func.isRequired,
};
