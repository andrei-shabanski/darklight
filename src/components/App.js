import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import {
  Modal,
  Dropdown,
  InputDropdown,
  NumericInputDropdown,
  ScreenBlock,
} from '../js/controls';
import DrawingDesk from '../services/desk';
import { initializePage } from '../js/drawing-page';
import { setDrawingDesk } from '../actions/desk/options';

import Spinner from './Spinner';
import Canvases from './Canvases';
import WelcomeModalContainer from '../containers/WelcomeModalContainer';
import ToolbarContainer from '../containers/ToolbarContainer';

import '../img/icons.svg';
import './app.scss';

function App({ setDrawingDesk }) {
  useEffect(() => {
    window.Modal = Modal;
    window.Dropdown = Dropdown;
    window.InputDropdown = InputDropdown;
    window.NumericInputDropdown = NumericInputDropdown;
    window.ScreenBlock = ScreenBlock;

    document.querySelectorAll('.dropdown').forEach(dropdown => new Dropdown(dropdown));

    document.querySelectorAll('.modal').forEach(modal => new Modal(modal));

    document.querySelectorAll('.screen-block').forEach(element => new ScreenBlock(element));

    const desk = new DrawingDesk(imageCanvas, drawingCanvas);
    initializePage(desk);
    window.desk = desk;
    setDrawingDesk(desk);
  }, []);

  return (
    <>
      <Spinner message='' iconName='' />
      <WelcomeModalContainer />
      <main className="desk">
        <ToolbarContainer />
        <Canvases />
      </main>
    </>
  );
}

// TODO disconnect App from redux after moving DrawingDesk initializating
const mapDispatchToProps = dispatch => ({
  setDrawingDesk: desk => dispatch(setDrawingDesk(desk)),
});

export default connect(null, mapDispatchToProps)(App);
