import React from "react";

import "./spinner.scss";

const Spinner = () => (
  <div id="spinner" className="screen-block">
    <div className="screen-content">
      <h1 className="screen-message"></h1>
      <svg className="screen-image icon icon--huge">
        <use xlinkHref=""></use>
      </svg>
    </div>
  </div>
);

export default Spinner;
