'use strict';

define(function() {

    /**
     * Небольшой класс для упрощения работы с локальным хранилищем.
     *
     * @constructor
     */
    var LS = function() {
    };

    /**
     * Префикс для ключей с данными о пользователях.
     *
     * @type {string}
     */
    LS.prototype.USER_PREFIX = 'habraUser.';

    /**
     * Получение пользователя из localStorage.
     *
     * @param {Object} username пользователь
     * @returns {Object} пользователь
     */
    LS.prototype.loadUser = function(username) {
        return JSON.parse(window.localStorage.getItem(this.USER_PREFIX + username));
    };

    /**
     * Сохранение пользователя в localStorage.
     *
     * @param {Object} user
     */
    LS.prototype.saveUser = function(user) {
        window.localStorage.setItem(this.USER_PREFIX + user.name, JSON.stringify(user));
    };

    return LS;

});
