import React from 'react';
import PropTypes from 'prop-types';

import Button from '../Button';
import Icon from '../Icon';
import classNames from '../../utils/classNames';

export default function DropdownToggle({ children, className, ...props }) {
  const classes = classNames('dropdown__toggle', className);

  return (
    <Button className={classes} {...props}>
      {children}
      <Icon name="chevron-down" className="round-180" size="small" />
    </Button>
  );
}

DropdownToggle.propTypes = {
  children: PropTypes.element,
  className: PropTypes.string,
};

DropdownToggle.defaultProps = {
  children: null,
  className: null,
};
