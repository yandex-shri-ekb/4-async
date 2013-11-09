'use strict';

define(function() {

    /**
     * Работа с локальным хранилищем localStorage.
     * @constructor
     */
    var Cache = function() {
    };

    /**
     * Получает данные из хранилища.
     * @param {string} id
     * @return {*} данные
     */
    Cache.prototype.get = function(id) {
        return JSON.parse(window.localStorage.getItem(id));
    };

    /**
     * Сохраняет данные в хранилище.
     * @param {string} id уникальный идентификатор записи
     * @param {*} value данные
     */
    Cache.prototype.set = function(id, value) {
        window.localStorage.setItem(id, JSON.stringify(value));
    };

    /**
     * Очищает хранилище.
     */
    Cache.prototype.clear = function() {
        window.localStorage.clear();
    };

    /**
     * Подсчитывает количество записей в кеше.
     * @return {number} количество записей в кеше
     */
    Cache.prototype.count = function() {
        return window.localStorage.length;
    };

    return Cache;

});
