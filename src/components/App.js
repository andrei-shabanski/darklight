import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { HotKeys } from 'react-hotkeys';

import { Dropdown } from '../js/controls';

import ScreenLock from './ScreenLock';
import Canvases from './Canvases';
import DropImageContainer from '../containers/DropImageContainer';
import ToolbarContainer from '../containers/ToolbarContainer';
import WelcomeModalContainer from '../containers/WelcomeModalContainer';
import { copyLink, saveImage } from '../actions/desk/media';

import '../img/icons.svg';
import './app.scss';

function App({ drawingDesk, loadingImage, savingImage, saveImage, copyLink }) {
  useEffect(() => {
    document.querySelectorAll('.dropdown').forEach(dropdown => new Dropdown(dropdown));

    // TODO: this method shows an alert to save changes. Now it doesn't work
    function showWarningBeforeLeaving(event) {
      if (savingImage) {
        event.preventDefault();
        event.returnValue = '';
      }
    }

    window.addEventListener('beforeunload', showWarningBeforeLeaving, false);

    return () => {
      window.removeEventListener('beforeunload', showWarningBeforeLeaving);
    };
  });

  const keyMap = {
    REMOVE_SHAPE: 'ctrl+z',
    SAVE_IMAGE: 'ctrl+s',
    COPE_LINK: 'ctrl+c',
  };

  const keyHandlers = {
    REMOVE_SHAPE: e => {
      e.preventDefault();
      if (drawingDesk) {
        drawingDesk.removeShape();
      }
    },
    SAVE_IMAGE: e => {
      e.preventDefault();
      if (drawingDesk) {
        saveImage();
      }
    },
    COPE_LINK: e => {
      e.preventDefault();
      if (drawingDesk) {
        copyLink();
      }
    },
  };

  return (
    <HotKeys keyMap={keyMap} handlers={keyHandlers}>
      {loadingImage ? <ScreenLock message="Loading the image" iconName="coffee" /> : null}
      <DropImageContainer />
      <WelcomeModalContainer />
      <main className="desk">
        <ToolbarContainer />
        <Canvases />
      </main>
    </HotKeys>
  );
}

// TODO disconnect App from redux after moving DrawingDesk initializating
const mapStateToProps = state => ({
  drawingDesk: state.desk.drawingDesk,
  loadingImage: state.desk.image.loading,
  savingImage: state.desk.image.saving,
});

const mapDispatchToProps = dispatch => ({
  saveImage: () => dispatch(saveImage()),
  copyLink: () => dispatch(copyLink()),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
