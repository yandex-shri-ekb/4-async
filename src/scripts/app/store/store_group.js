define(function(require) {
    'use strict';

    var EventEmitter = require('app/event_emitter');

    /** 
     * @class
     * @classdesc Класс реализует методы контролирующие создание группы пользователей. 
     */
    var StoreGroup = function(index, username) {
        EventEmitter.call(this);
        this.usernames = [username] || [];
        this.index = index || 0;
        this.counter = 0;
    };

    StoreGroup.prototype = $.extend({
        /**
         * Метод увеличивает счетчик активных запросов.
         * 
         * @return {Number}
         */
        waitPush: function() {
            return ++this.counter;
        },

        /**
         * Метод уменьшает счетчик активных запросов. 
         * 
         * @return {Number}
         */
        diminish: function() {
            return --this.counter;
        },

        /**
         * Метод добавляет пользователя в группу.
         *
         * @fires StoreGroup#done
         * 
         * @param  {String} username
         * @return {Object}
         */
        push: function (username) {
            this.usernames.push(username);

            /**
             * @event StoreGroup#done
             * @type {Object}
             */
            --this.counter === 0 && this.emit('done', {
                index: this.index,
                usernames: this.usernames
            });

            return this;
        },

        contains: function(username) {
            return this.usernames.indexOf(username) > -1;
        }
    }, EventEmitter.prototype);

    return StoreGroup;
});
