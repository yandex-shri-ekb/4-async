define(function(require) {
    'use strict';

    var $ = require('jquery');

    var EventTarget = function() {
        this.listeners = {};
    };

    EventTarget.prototype = {
        on: function(event, listener) {
            if(typeof this.listeners[event] === 'undefined') {
                this.listeners[event] = [];
            }

            this.listeners[event].push(listener);
        },

        trigger: function(event, data) {
            var listeners = this.listeners[event];
            if(listeners instanceof Array) {
                for (var i = 0, len = listeners.length; i < len; i++) {
                    listeners[i].call(this, data);
                }
            }
        }
    };

    return EventTarget;
});
