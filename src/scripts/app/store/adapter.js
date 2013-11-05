define(function(require) {
    'use strict';

    /**
     * @class
     * @classdesc Класс реализует методы взаимодействия с localStorage.
     */
    var Adapter = function(prefix) {
        this.prefix = prefix ? prefix + '.' : '';
        this.isEnabled = this.isSupported();
    };

    Adapter.prototype = {
        /**
         * Метод проверяет поддержку localStorage.
         * 
         * @return {Boolean}
         */
        isSupported: function() {
            var data = 'test';
            try {
                localStorage.setItem(data, data);
                localStorage.removeItem(data);
                return true;
            } catch(ex) {
                return false;
            }
        },

        /**
         * Метод обработки ключа.
         * 
         * @param  {String|Object} key
         * @return {String}
         */
        getKey: function(key) {
            if (typeof key === 'object') {
                key = key.prefix + '.' + key.key;
            }
            return this.prefix + key;
        },

        /**
         * Метод записи значения.
         * 
         * @param  {String|Object}   key
         * @param  {Object}          value
         * @return {Object}          Adapter
         */
        set: function(key, value) {
            this.isEnabled && localStorage.setItem(this.getKey(key), JSON.stringify(value));
            return this;
        },

        /**
         * Метод получения значения.
         * 
         * @param  {String|Object} key
         * @return {Object}
         */
        get: function(key) {
            return this.isEnabled ? JSON.parse(localStorage.getItem(this.getKey(key))) : {};
        },

        /**
         * Метод полностью очищает localStorage.
         * @return {Object} Adapter
         */
        clear: function() {
            this.isEnabled && localStorage.clear();
            return this;
        }

    };

    return Adapter;
});
