import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../Icon';
import './spinner.scss';

const Spinner = ({ message, iconName }) => (
  <div id="spinner" className="screen-block">
    <div className="screen-content">
      <h1 className="screen-message">{message}</h1>
      <Icon name={iconName} size="huge" className="screen-image" />
    </div>
  </div>
);

Spinner.propTypes = {
  message: PropTypes.string,
  iconName: PropTypes.string,
};

Spinner.defaultProps = {
  message: '',
  iconName: '',
};

export default Spinner;
