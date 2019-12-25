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
      <div id="spinner" className="screen-block">
        <div className="screen-content">
          <h1 className="screen-message"></h1>
          <svg className="screen-image icon icon-extra-large">
            <use xlinkHref=""></use>
          </svg>
        </div>
      </div>

      <div id="welcome" className="modal" data-open>
        <div className="modal-content">
          <div className="modal-body">
            <section className="getting-started">
              <h1 className="center">Welcome</h1>
              <p className="center">
                Click <kbd>Ctrl+V</kbd> to paste an image from the clipboard
              </p>
              <p className="center">or drag an image to the browser</p>
              <p className="center">or choose an image from your computer</p>
              <div className="center">
                <input id="fileBtn" className="center" type="file" accept="image/*" />
              </div>
            </section>
            <section className="guide">
              <article>
                <h3>You can...</h3>
                <p>* load an image from the clipboard and your computer</p>
                <p>* draw lines, rectangles, ellipses, arrows, text</p>
                <p>
                  * use a <code>Pen</code> to draw anything else
                </p>
                <p>* download a PNG image</p>
              </article>
              <article>
                <h3>Controls</h3>
                <p>
                  <kbd>Ctrl+V</kbd> to paste an image from the clipboard
                </p>
                <p>
                  <kbd>Ctrl+S</kbd> to download an image
                </p>
                <p>
                  <kbd>Ctrl+Z</kbd> to undo an action
                </p>
                <p>
                  <kbd>Ctrl+Scroll</kbd> to zoom
                </p>
              </article>
            </section>
            <section>
              <p>
                Read and agree with our <a href="/policy/">Privacy Policy</a> and
                <a href="/terms/">Terms of Use</a> before using our app.
              </p>
            </section>
          </div>
        </div>
      </div>

      <main className="desk">
        <nav className="toolbar">
          <div className="tools">
            <button
              className="btn btn-flat btn-dark flex-stretch"
              data-tool="text"
              data-options="color textSize"
            >
              <svg className="icon">
                <use xlinkHref="images/icons.svg#text"></use>
              </svg>
            </button>
            <button
              className="btn btn-flat btn-dark flex-stretch"
              data-tool="pen"
              data-options="color size"
            >
              <svg className="icon">
                <use xlinkHref="images/icons.svg#pen"></use>
              </svg>
            </button>
            <button
              className="btn btn-flat btn-dark flex-stretch"
              data-tool="line"
              data-options="color size"
            >
              <svg className="icon">
                <use xlinkHref="images/icons.svg#line"></use>
              </svg>
            </button>
            <button
              className="btn btn-flat btn-dark flex-stretch"
              data-tool="rectangle"
              data-options="color size"
            >
              <svg className="icon">
                <use xlinkHref="images/icons.svg#rectangle"></use>
              </svg>
            </button>
            <button
              className="btn btn-flat btn-dark flex-stretch"
              data-tool="ellipse"
              data-options="color size"
            >
              <svg className="icon">
                <use xlinkHref="images/icons.svg#ellipse"></use>
              </svg>
            </button>
            <button
              className="btn btn-flat btn-dark flex-stretch"
              data-tool="arrow"
              data-options="color size"
            >
              <svg className="icon">
                <use xlinkHref="images/icons.svg#arrow"></use>
              </svg>
            </button>
            <button id="cropBtn" className="btn btn-flat btn-dark flex-stretch" data-tool="crop">
              <svg className="icon">
                <use xlinkHref="images/icons.svg#crop"></use>
              </svg>
            </button>
          </div>

          <div className="options">
            <div
              id="sizeOption"
              className="dropdown dropdown-dark dropdown-flat flex-stretch hidden"
            >
              <button className="dropdown-toggle btn btn-flat btn-dark">
                <input id="sizeOptionInput" type="text" defaultValue="5px" />
                <svg className="icon icon-small round-180">
                  <use xlinkHref="images/icons.svg#chevron-down"></use>
                </svg>
              </button>
              <div className="dropdown-menu">
                <div className="dropdown-group">
                  <button
                    className="btn btn-flat btn-dark"
                    data-dropdown-noclose
                    data-option-action="decrease"
                  >
                    <svg className="icon">
                      <use xlinkHref="images/icons.svg#minus"></use>
                    </svg>
                  </button>
                  <button
                    className="btn btn-flat btn-dark"
                    data-dropdown-noclose
                    data-option-action="increase"
                  >
                    <svg className="icon">
                      <use xlinkHref="images/icons.svg#plus"></use>
                    </svg>
                  </button>
                </div>
                <button className="btn btn-flat btn-dark" data-option-value="2">
                  2px
                </button>
                <button className="btn btn-flat btn-dark" data-option-value="5">
                  5px
                </button>
                <button className="btn btn-flat btn-dark" data-option-value="8">
                  8px
                </button>
                <button className="btn btn-flat btn-dark" data-option-value="14">
                  14px
                </button>
                <button className="btn btn-flat btn-dark" data-option-value="24">
                  24px
                </button>
                <button className="btn btn-flat btn-dark" data-option-value="36">
                  36px
                </button>
                <button className="btn btn-flat btn-dark" data-option-value="72">
                  72px
                </button>
              </div>
            </div>

            <div
              id="textSizeOption"
              className="dropdown dropdown-dark dropdown-flat flex-stretch hidden"
            >
              <button className="dropdown-toggle btn btn-flat btn-dark">
                <input id="textSizeOptionInput" type="text" defaultValue="18px" />
                <svg className="icon icon-small round-180">
                  <use xlinkHref="images/icons.svg#chevron-down"></use>
                </svg>
              </button>
              <div className="dropdown-menu">
                <div className="dropdown-group">
                  <button className="btn btn-flat btn-dark" data-option-action="decrease">
                    <svg className="icon">
                      <use xlinkHref="images/icons.svg#minus"></use>
                    </svg>
                  </button>
                  <button className="btn btn-flat btn-dark" data-option-action="increase">
                    <svg className="icon">
                      <use xlinkHref="images/icons.svg#plus"></use>
                    </svg>
                  </button>
                </div>
                <button className="btn btn-flat btn-dark" data-option-value="6">
                  6px
                </button>
                <button className="btn btn-flat btn-dark" data-option-value="10">
                  10px
                </button>
                <button className="btn btn-flat btn-dark" data-option-value="14">
                  14px
                </button>
                <button className="btn btn-flat btn-dark" data-option-value="18">
                  18px
                </button>
                <button className="btn btn-flat btn-dark" data-option-value="24">
                  24px
                </button>
                <button className="btn btn-flat btn-dark" data-option-value="36">
                  36px
                </button>
                <button className="btn btn-flat btn-dark" data-option-value="72">
                  72px
                </button>
              </div>
            </div>

            <div
              id="colorOption"
              className="dropdown dropdown-dark dropdown-flat flex-stretch hidden"
            >
              <button className="dropdown-toggle btn btn-flat btn-dark">
                <svg className="icon" style={{ fill: "#ff0000", stroke: "#ff0000" }}>
                  <use xlinkHref="images/icons.svg#rectangle"></use>
                </svg>
              </button>
              <div className="dropdown-menu">
                <div className="dropdown-group">
                  <button className="btn btn-flat btn-dark active" data-color-set="#ff0000">
                    <svg className="icon icon-red">
                      <use xlinkHref="images/icons.svg#rectangle"></use>
                    </svg>
                  </button>
                  <button className="btn btn-flat btn-dark" data-color-set="#00ff00">
                    <svg className="icon icon-green">
                      <use xlinkHref="images/icons.svg#rectangle"></use>
                    </svg>
                  </button>
                  <button className="btn btn-flat btn-dark" data-color-set="#0000ff">
                    <svg className="icon icon-blue">
                      <use xlinkHref="images/icons.svg#rectangle"></use>
                    </svg>
                  </button>
                </div>
                <div className="dropdown-group">
                  <button className="btn btn-flat btn-dark" data-color-set="#ffffff">
                    <svg className="icon icon-white">
                      <use xlinkHref="images/icons.svg#rectangle"></use>
                    </svg>
                  </button>
                  <button className="btn btn-flat btn-dark" data-color-set="#ffff00">
                    <svg className="icon icon-yellow">
                      <use xlinkHref="images/icons.svg#rectangle"></use>
                    </svg>
                  </button>
                  <button className="btn btn-flat btn-dark" data-color-set="#000000">
                    <svg className="icon icon-black">
                      <use xlinkHref="images/icons.svg#rectangle"></use>
                    </svg>
                  </button>
                </div>
                <button className="btn btn-flat btn-dark picker-button" data-color-picker>
                  <svg className="icon">
                    <use xlinkHref="images/icons.svg#rectangle"></use>
                  </svg>
                  Other
                </button>
              </div>
            </div>
            <input id="colorPicker" className="hidden" type="color" />

            <div id="scaleOption" className="dropdown dropdown-dark dropdown-flat flex-stretch">
              <button className="dropdown-toggle btn btn-flat btn-dark">
                <input id="scaleOptionInput" type="text" defaultValue="100%" />
                <svg className="icon icon-small round-180">
                  <use xlinkHref="images/icons.svg#chevron-down"></use>
                </svg>
              </button>
              <div className="dropdown-menu">
                <div className="dropdown-group">
                  <button
                    className="btn btn-flat btn-dark"
                    data-dropdown-noclose
                    data-option-action="decrease"
                  >
                    <svg className="icon">
                      <use xlinkHref="images/icons.svg#minus"></use>
                    </svg>
                  </button>
                  <button className="btn btn-flat btn-dark" data-option-action="fillIn">
                    <svg className="icon">
                      <use xlinkHref="images/icons.svg#maximize"></use>
                    </svg>
                  </button>
                  <button
                    className="btn btn-flat btn-dark"
                    data-dropdown-noclose
                    data-option-action="increase"
                  >
                    <svg className="icon">
                      <use xlinkHref="images/icons.svg#plus"></use>
                    </svg>
                  </button>
                </div>

                <button className="btn btn-flat btn-dark" data-option-value="0.5">
                  50%
                </button>
                <button className="btn btn-flat btn-dark" data-option-value="1">
                  100%
                </button>
                <button className="btn btn-flat btn-dark" data-option-value="2">
                  200%
                </button>
              </div>
            </div>
          </div>

          <button id="menu-toggle" className="btn btn-dark btn-flat flex-stretch">
            <svg className="icon">
              <use xlinkHref="images/icons.svg#menu"></use>
            </svg>
          </button>

          <div className="menu">
            <button id="saveBtn" className="btn btn-dark btn-flat flex-stretch">
              <span className="light light-green"></span>
              <span id="savingStatus">Saved</span>
            </button>

            <div className="dropdown dropdown-dark dropdown-flat flex-stretch">
              <button className="dropdown-toggle btn btn-dark btn-flat">
                <svg className="icon">
                  <use xlinkHref="images/icons.svg#save"></use>
                </svg>
              </button>
              <div className="dropdown-menu dropdown-menu--right">
                <button id="imageEditLinkBtn" className="btn btn-dark btn-flat">
                  <svg className="icon icon-small">
                    <use xlinkHref="images/icons.svg#link"></use>
                  </svg>
                  <span>Copy a link</span>
                </button>
                <button id="imageDirectLinkBtn" className="btn btn-dark btn-flat">
                  <svg className="icon icon-small">
                    <use xlinkHref="images/icons.svg#link"></use>
                  </svg>
                  <span>Copy a direct link</span>
                </button>
                <button id="downloadBtn" className="btn btn-dark btn-flat">
                  <svg className="icon icon-small">
                    <use xlinkHref="images/icons.svg#download"></use>
                  </svg>
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="canvases">
          <canvas id="imageCanvas">Your browser is not supported</canvas>
          <canvas id="drawingCanvas"></canvas>
        </div>
      </main>
    </>
  );
}

export default App;
