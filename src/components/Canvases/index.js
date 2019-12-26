import React from "react";

import "./canvases.scss";

const Canvases = () => (
  <div className="canvases">
    <canvas id="imageCanvas">Your browser is not supported</canvas>
    <canvas id="drawingCanvas"></canvas>
  </div>
);

export default Canvases;
