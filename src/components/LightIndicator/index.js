import PropTypes from 'prop-types';
import React from 'react';

import classNames from '../../utils/classNames';
import './light.scss';

export default class LightIndicator extends React.Component {
  static propTypes = {
    color: PropTypes.oneOf(['green', 'yellow', 'red']),
    mode: PropTypes.oneOf(['shine', 'blink']),
  };

  static defaultProps = {
    color: 'green',
    mode: 'shine',
  };

  render() {
    const { color, mode } = this.props;

    const classes = classNames('light', `light--${color}`, mode === 'blink' && 'light--blinking');

    return <span className={classes} />;
  }
}
