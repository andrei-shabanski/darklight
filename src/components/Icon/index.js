import React from 'react';
import PropTypes from 'prop-types';

import classNames from '../../utils/classNames';
import './icons.scss';

const Icon = ({ name, className, isSmall, style }) => {
  const classes = classNames('icon', className, {
    'icon-small': isSmall,
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
  isSmall: PropTypes.bool,
  style: PropTypes.shape({
    fill: PropTypes.string,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.number,
  }),
};

Icon.defaultProps = {
  className: '',
  isSmall: false,
  style: null,
};

export default Icon;
