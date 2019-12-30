import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';

export const firebaseApp = firebase.initializeApp({
  apiKey: 'AIzaSyCiqM8QiC3rZImR3kY7MPscYxxUqDB0gbQ',
  authDomain: 'darklight-image-editor.firebaseapp.com',
  databaseURL: 'https://darklight-image-editor.firebaseio.com',
  projectId: 'darklight-image-editor',
  storageBucket: 'darklight-image-editor.appspot.com',
  messagingSenderId: '1080138239147',
});

window.firebase = firebaseApp;
