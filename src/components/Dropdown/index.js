import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import DropdownToggle from './toggle';
import DropdownMenu from './menu';
import classNames from '../../utils/classNames';

import './dropdown.scss';

function Dropdown({ children, className, variant, rounded, opened, onBackgroundClick, ...props }) {
  const classes = classNames(
    'dropdown',
    className,
    variant && `dropdown--${variant}`,
    rounded && `dropdown--rounded-${rounded}`
  );
  const dataProps = {};
  if (opened) {
    dataProps['data-open'] = true;
  }

  useEffect(() => {
    if (!onBackgroundClick) {
      return;
    }

    const handleBackgroundClick = e => {
      if (!e.target.closest('.dropdown[data-open]')) {
        onBackgroundClick();
      }
    };

    window.addEventListener('click', handleBackgroundClick, true);
    return () => {
      window.removeEventListener('click', handleBackgroundClick);
    };
  });

  return (
    <div className={classes} {...dataProps} {...props}>
      {children}
    </div>
  );
}

Dropdown.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element),
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  rounded: PropTypes.string,
  opened: PropTypes.bool.isRequired,
  onBackgroundClick: PropTypes.func,
};

Dropdown.defaultProps = {
  children: null,
  className: null,
  variant: 'primary',
  rounded: null,
  onBackgroundClick: null,
};

Dropdown.Toggle = DropdownToggle;
Dropdown.Menu = DropdownMenu;

export default Dropdown;
