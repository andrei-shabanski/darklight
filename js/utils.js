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
