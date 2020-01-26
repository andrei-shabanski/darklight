import React from 'react';
import PropTypes from 'prop-types';

import classNames from '../../utils/classNames';

export default function DropdownMenu({ children, className, ...props }) {
  const classes = classNames('dropdown__menu', className);

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

DropdownMenu.propTypes = {
  children: PropTypes.element,
  className: PropTypes.string,
};

DropdownMenu.defaultProps = {
  children: null,
  className: null,
};
