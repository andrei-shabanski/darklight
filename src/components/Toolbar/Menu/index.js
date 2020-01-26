import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../Button';
import Icon from '../../Icon';
import UserMenu from './UserMenu';
import ImageMenu from './ImageMenu';
import LightIndicator from '../../LightIndicator';
import { NOT_SAVED_STATUS, SAVING_STATUS } from '../../../constants/desk';

export default function Menu({
  saveStatus,
  saveImage,
  user,
  signIn,
  signOut,
  download,
  copyDirectLink,
  copyLink,
}) {
  let indicatorMessage;
  let indicatorMode;
  let indicatorColor;
  switch (saveStatus) {
    case NOT_SAVED_STATUS:
      indicatorMessage = 'Not saved';
      indicatorColor = 'red';
      indicatorMode = 'shine';
      break;
    case SAVING_STATUS:
      indicatorMessage = 'Saving';
      indicatorColor = 'green';
      indicatorMode = 'blink';
      break;
    default:
      indicatorMessage = 'Saved';
      indicatorColor = 'green';
      indicatorMode = 'shine';
      break;
  }

  return (
    <>
      <Button id="menu-toggle" className="flex-stretch" variant="secondary" rounded="0">
        <Icon name="menu" />
      </Button>

      <div className="menu">
        <Button className="flex-stretch" variant="secondary" rounded="0" onClick={saveImage}>
          <LightIndicator color={indicatorColor} mode={indicatorMode} />
          <span>{indicatorMessage}</span>
        </Button>

        <ImageMenu download={download} copyDirectLink={copyDirectLink} copyLink={copyLink} />
        <UserMenu user={user} signIn={signIn} signOut={signOut} />
      </div>
    </>
  );
}

Menu.propTypes = {
  saveStatus: PropTypes.string.isRequired,
  saveImage: PropTypes.func.isRequired,

  user: PropTypes.shape.isRequired,
  signIn: PropTypes.func.isRequired,
  signOut: PropTypes.func.isRequired,
  download: PropTypes.func.isRequired,
  copyDirectLink: PropTypes.func.isRequired,
  copyLink: PropTypes.func.isRequired,
};
