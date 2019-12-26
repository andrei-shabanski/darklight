export function inherit(klass, parent) {
  klass.prototype = Object.create(parent.prototype);
  klass.prototype.constructor = klass;
  klass.super = parent.prototype;
}

export function call(func, context, args) {
  if (func) {
    return func.apply(context, args);
  }
  return undefined;
}

export function dateToString(date, format) {
  const numberToString = (x, pad = 2) => x.toString().padStart(pad, '0');

  format = format || 'dd-mm-yyyy_H:M:S';
  return format
    .replace('dd', numberToString(date.getDate()))
    .replace('mm', numberToString(date.getMonth()))
    .replace('yyyy', numberToString(date.getFullYear(), 4))
    .replace('H', numberToString(date.getHours()))
    .replace('M', numberToString(date.getMinutes()))
    .replace('S', numberToString(date.getSeconds()));
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

export function randomString(radix = 16) {
  return Math.floor(new Date().getTime() * Math.random()).toString(radix);
}

export function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject();
    image.src = url;
  });
}

export class Eventable {
  constructor() {
    this.registeredEvents = {}; // mapping eventType -> callbacks
  }

  on(eventType, callback) {
    if (!(eventType in this.registeredEvents)) {
      this.registeredEvents[eventType] = [];
    }

    this.registeredEvents[eventType].push(callback);
  }

  off(eventType, callback) {
    const events = this.registeredEvents[eventType];
    if (!events) {
      return;
    }

    const callbackIndex = events.indexOf(callback);
    events.splice(callbackIndex, 1);
  }

  emit(eventType, details) {
    const events = this.registeredEvents[eventType];
    if (!events) {
      return;
    }

    details = details || [];

    events.slice(0).forEach(callback => callback(details));
  }
}
