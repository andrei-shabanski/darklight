import React from 'react';
import PropTypes from 'prop-types';

import classNames from '../../utils/classNames';
import './icons.scss';

const Icon = ({ name, className, size, style }) => {
  const prefix = 'icon';
  const classes = classNames(className, prefix, {
    [`${prefix}--${size}`]: size,
  });

  return (
    <svg className={classes} style={style}>
      <use xlinkHref={`images/icons.svg#${name}`} />
    </svg>
  );
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'large', 'huge']),
  style: PropTypes.shape({
    fill: PropTypes.string,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.number,
  }),
};

Icon.defaultProps = {
  className: '',
  size: null,
  style: null,
};

export default Icon;
