import React from 'react';
import PropTypes from 'prop-types';

import classNames from '../../utils/classNames';
import './button.scss';

const Button = ({ children, className, variant, rounded, isActive, ...props }) => {
  const prefix = 'button';
  const classes = classNames(
    className,
    prefix,
    variant && `${prefix}--${variant}`,
    rounded && `${prefix}--rounded-${rounded}`,
    isActive && `${prefix}--active`
  );

  return (
    <button type="button" className={classes} {...props}>
      <div className={`${prefix}__content`}>{children}</div>
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  rounded: PropTypes.string,
  isActive: PropTypes.bool,
};

Button.defaultProps = {
  children: '',
  className: '',
  variant: null,
  rounded: null,
  isActive: false,
};

export default Button;
