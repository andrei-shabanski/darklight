import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../Icon';
import classNames from '../../utils/classNames';
import './spinner.scss';

const ScreenLock = ({ message, iconName, className }) => {
  const classes = classNames('screen-lock', className);

  return (
    <div className={classes}>
      <div className="screen-lock__content">
        <h1 className="screen-lock__message">{message}</h1>
        <Icon name={iconName} size="huge" className="screen-lock__image" />
      </div>
    </div>
  );
};

ScreenLock.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string,
  iconName: PropTypes.string,
};

ScreenLock.defaultProps = {
  className: null,
  message: '',
  iconName: '',
};

export default ScreenLock;
