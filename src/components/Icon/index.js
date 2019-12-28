import React from 'react';
import PropTypes from 'prop-types';

import classNames from '../../utils/classNames';
import './icons.scss';

const Icon = ({ name, className, size, ...props }) => {
  const prefix = 'icon';
  const classes = classNames(className, prefix, {
    [`${prefix}--${size}`]: size,
  });

  return (
    <svg className={classes} {...props}>
      <use xlinkHref={`images/icons.svg#${name}`} />
    </svg>
  );
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'large', 'huge']),
};

Icon.defaultProps = {
  className: '',
  size: null,
};

export default Icon;
