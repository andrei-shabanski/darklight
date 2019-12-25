export function inherit(klass, parent) {
    klass.prototype = Object.create(parent.prototype);
    klass.prototype.constructor = klass;
    klass.super = parent.prototype;
}

export function call(func, context, args) {
    if (!!func) {
        return func.apply(context, args);
    }
    return undefined;

}

export function dateToString(date, format) {
    format = format || 'dd-mm-yyyy_H:M:S';
    return format
        .replace('dd', date.getDate().toString().padStart(2, '0'))
        .replace('mm', date.getMonth().toString().padStart(2, '0'))
        .replace('yyyy', date.getFullYear().toString())
        .replace('H', date.getHours().toString().padStart(2, '0'))
        .replace('M', date.getMinutes().toString().padStart(2, '0'))
        .replace('S', date.getSeconds().toString().padStart(2, '0'));
}

export function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);

    textarea.select();
    document.execCommand('copy');

    document.body.removeChild(textarea);
}

export function randomString(length=16) {
    return Math.floor(new Date().getTime() * Math.random()).toString(length);
}

export class Eventable {
  constructor() {
    this._events = {};  // mapping eventType -> callbacks
  }

  on(eventType, callback) {
    if (!this._events.hasOwnProperty(eventType)) {
      this._events[eventType] = [];
    }

    this._events[eventType].push(callback);
  }

  off(eventType, callback) {
    const events = this._events[eventType];
    if (!events) {
      return;
    }

    const callbackIndex = events.indexOf(callback);
    events.splice(callbackIndex, 1);
  }

  emit(eventType, details) {
    const events = this._events[eventType];
    if (!events) {
      return;
    }

    details = details || [];

    events.slice(0).forEach(function(callback) {
      callback.apply(this, details);
    });
  }
}
