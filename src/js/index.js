import "../css/normalize.css";
import "../css/controls.css";
import "../css/style.css";

import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";

import { DrawingDesk } from "./canvas";
import { initializePage } from "./drawing-page";

window.addEventListener('load', function () {
  firebase.initializeApp({
    apiKey: "AIzaSyCiqM8QiC3rZImR3kY7MPscYxxUqDB0gbQ",
    authDomain: "darklight-image-editor.firebaseapp.com",
    databaseURL: "https://darklight-image-editor.firebaseio.com",
    projectId: "darklight-image-editor",
    storageBucket: "darklight-image-editor.appspot.com",
    messagingSenderId: "1080138239147"
  });

  var desk = new DrawingDesk(
    imageCanvas,
    drawingCanvas
  );

  initializePage(desk);

  window.desk = desk;
});
