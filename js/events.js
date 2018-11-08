'use strict';

var EventListener = (function() {
    function EventListener() {
        this._events = {};
    }

    EventListener.prototype.on = function(eventType, callback) {
        if (!this._events.hasOwnProperty(eventType)) {
            this._events[eventType] = [];
        }

        this._events[eventType].push(callback);
    };

    EventListener.prototype.off = function(eventType, callback) {
        var events = this._events[eventType];
        if (!events) {
            return
        }

        var callbackIndex = events.indexOf(callback);
        events.splice(callbackIndex, 1);
    }

    EventListener.prototype.emit = function(eventType, details) {
        var events = this._events[eventType];
        if (!events) {
            return
        }

        details = details || [];

        events.slice(0).forEach(function(callback) {
            callback.apply(this, details);
        });
    }

    return EventListener;
})();
