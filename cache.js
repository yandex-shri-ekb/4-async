'use strict';

define(function() {

    /**
     * Работа с локальным хранилищем.
     * @constructor
     */
    var Cache = function() {
    };

    /**
     * Префикс для ключей с данными о пользователях.
     * @const
     * @type {string}
     */
    Cache.prototype.USER_PREFIX = 'habraUserv2.';

    /**
     * Получение пользователя из localStorage.
     * @param {Object} username пользователь
     * @return {Object} пользователь
     */
    Cache.prototype.loadUser = function(username) {
        return JSON.parse(window.localStorage.getItem(this.USER_PREFIX + username));
    };

    /**
     * Сохранение пользователя в localStorage.
     * @param {Object} user
     */
    Cache.prototype.saveUser = function(user) {
        window.localStorage.setItem(this.USER_PREFIX + user.name, JSON.stringify(user));
    };

    return Cache;

});
