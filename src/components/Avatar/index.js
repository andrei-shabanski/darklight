import React from 'react';
import PropTypes from 'prop-types';

import './avatar.scss';

const Avatar = ({ imageUrl }) => <img src={imageUrl} className="avatar" alt="" />;

Avatar.propTypes = {
  imageUrl: PropTypes.string.isRequired,
};

export default Avatar;
