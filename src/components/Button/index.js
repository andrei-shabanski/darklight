import React from 'react';
import PropTypes from 'prop-types';

import classNames from '../../utils/classNames';
import './button.scss';

const Button = ({ children, isActive, isFlat, isDark, className, ...props }) => {
  const classes = classNames(className, 'btn', {
    active: isActive,
    'btn-dark': isDark,
    'btn-flat': isFlat,
  });

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.oneOfType(PropTypes.elementType, PropTypes.arrayOf(PropTypes.elementType)),
  className: PropTypes.string,
  isActive: PropTypes.bool,
  isFlat: PropTypes.bool,
  isDark: PropTypes.bool,
};

Button.defaultProps = {
  children: '',
  className: [],
  isActive: false,
  isFlat: true,
  isDark: true,
};

export default Button;
