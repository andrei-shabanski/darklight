'use strict';

function inherit(klass, parent) {
    klass.prototype = Object.create(parent.prototype);
    klass.prototype.constructor = klass;
    klass.super = parent.prototype;
}

function dateToString(date, format) {
    format = format || 'dd-mm-yyyy_H:M:S';
    var result = format
        .replace('dd', date.getDate().toString().padStart(2, '0'))
        .replace('mm', date.getMonth().toString().padStart(2, '0'))
        .replace('yyyy', date.getFullYear().toString())
        .replace('H', date.getHours().toString().padStart(2, '0'))
        .replace('M', date.getMinutes().toString().padStart(2, '0'))
        .replace('S', date.getSeconds().toString().padStart(2, '0'));

    return result;
}

function copyToClipboard(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);

    textarea.select();
    document.execCommand('copy');

    document.body.removeChild(textarea);
}

function randomString() {
    return Math.floor(new Date().getTime() * Math.random()).toString(16);
}


function Eventable() {
    this._events = {};
}

Eventable.prototype.on = function(eventType, callback) {
    if (!this._events.hasOwnProperty(eventType)) {
        this._events[eventType] = [];
    }

    this._events[eventType].push(callback);
};

Eventable.prototype.off = function(eventType, callback) {
    var events = this._events[eventType];
    if (!events) {
        return
    }

    var callbackIndex = events.indexOf(callback);
    events.splice(callbackIndex, 1);
}

Eventable.prototype.emit = function(eventType, details) {
    var events = this._events[eventType];
    if (!events) {
        return
    }

    details = details || [];

    events.slice(0).forEach(function(callback) {
        callback.apply(this, details);
    });
}
