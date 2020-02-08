import React from 'react';
import PropTypes from 'prop-types';

import classNames from '../../utils/classNames';

export default function DropdownMenu({ children, className, position, ...props }) {
  const classes = classNames(
    'dropdown__menu',
    position && `dropdown__menu--${position}`,
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

DropdownMenu.propTypes = {
  children: PropTypes.element,
  className: PropTypes.string,
  position: PropTypes.oneOf(['right', 'left']),
};

DropdownMenu.defaultProps = {
  children: null,
  className: null,
  position: null,
};
