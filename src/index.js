import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";

import store from "./store";
import App from "./components/App.js";

import "normalize.css";
import "./root.scss";

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root"),
  () => {
    window.firebase = firebase;
    firebase.initializeApp({
      apiKey: "AIzaSyCiqM8QiC3rZImR3kY7MPscYxxUqDB0gbQ",
      authDomain: "darklight-image-editor.firebaseapp.com",
      databaseURL: "https://darklight-image-editor.firebaseio.com",
      projectId: "darklight-image-editor",
      storageBucket: "darklight-image-editor.appspot.com",
      messagingSenderId: "1080138239147"
    });
  }
);
