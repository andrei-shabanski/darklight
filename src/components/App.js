import React, { useEffect } from "react";

import {
  Modal,
  Dropdown,
  InputDropdown,
  NumericInputDropdown,
  ScreenBlock
} from "../js/controls.js";
import { DrawingDesk } from "../js/desk";
import { initializePage } from "../js/drawing-page";

import Spinner from "./Spinner";
import WelcomeModal from "./WelcomeModal";
import Toolbar from "./Toolbar";
import Canvases from "./Canvases";

import "../css/normalize.css";
import "../css/controls.css";
import "../css/style.css";
import "../img/icons.svg";

function App() {
  useEffect(() => {
    window.Modal = Modal;
    window.Dropdown = Dropdown;
    window.InputDropdown = InputDropdown;
    window.NumericInputDropdown = NumericInputDropdown;
    window.ScreenBlock = ScreenBlock;

    document.querySelectorAll(".dropdown").forEach(function(dropdown) {
      new Dropdown(dropdown);
    });

    document.querySelectorAll(".modal").forEach(function(modal) {
      new Modal(modal);
    });

    document.querySelectorAll(".screen-block").forEach(function(element) {
      new ScreenBlock(element);
    });

    var desk = new DrawingDesk(imageCanvas, drawingCanvas);
    initializePage(desk);
    window.desk = desk;
  }, []);

  return (
    <>
      <Spinner />
      <WelcomeModal />
      <main className="desk">
        <Toolbar />
        <Canvases />
      </main>
    </>
  );
}

export default App;
