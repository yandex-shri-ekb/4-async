define(function(require) {
    'use strict';

    var $ = require('jquery');

    /** @class */
    var EventEmitter = function() {
        this.listeners = {};
    };

    EventEmitter.prototype = {
        /**
         * Метод позволяет подписаться на событие.
         * 
         * @param  {String}   event    Имя события
         * @param  {Function} listener Обработчик
         * @return {*}
         */
        on: function(event, listener) {
            if(typeof this.listeners[event] === 'undefined') {
                this.listeners[event] = [];
            }

            this.listeners[event].push(listener);
        },

        /**
         * Метод вызывает событие.
         * 
         * @param  {String} event Имя события
         * @param  {*}      data  Данные передаваемые в обработчик
         * @return {*}
         */
        emit: function(event, data) {
            var listeners = this.listeners[event];
            if(listeners instanceof Array) {
                for (var i = 0, len = listeners.length; i < len; i++) {
                    listeners[i].call(this, data);
                }
            }
        }
    };

    return EventEmitter;
});
