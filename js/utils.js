'use strict';

function inherit(klass, parent) {
    klass.prototype = Object.create(parent.prototype);
    klass.prototype.constructor = klass;
    klass.super = parent.prototype;
}

function hideElement(element, className) {
    className = className || 'hidden';
    element.classList.add(className);
}

function showElement(element, className) {
    className = className || 'hidden';
    element.classList.remove(className);
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
