const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const api = require('./api');

exports.api = functions.https.onRequest(api);
