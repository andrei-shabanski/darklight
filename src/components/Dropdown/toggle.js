import React from 'react';
import PropTypes from 'prop-types';

import Button from '../Button';
import Icon from '../Icon';
import classNames from '../../utils/classNames';

export default function DropdownToggle({ children, className, arrow, ...props }) {
  const classes = classNames('dropdown__toggle', className);

  return (
    <Button className={classes} {...props}>
      {children}
      {arrow ? <Icon name="chevron-down" className="round-180" size="small" /> : null}
    </Button>
  );
}

DropdownToggle.propTypes = {
  children: PropTypes.element,
  className: PropTypes.string,
  arrow: PropTypes.bool,
};

DropdownToggle.defaultProps = {
  children: null,
  className: null,
  arrow: true,
};
