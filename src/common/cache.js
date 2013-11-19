(function () {
    'use strict';

    var Cache = function (label) {
        this.label = label;
        this.storage = localStorage[this.label] ? JSON.parse(localStorage[this.label]) : {};
    };

    Cache.prototype.get = function (key) {
        return this.storage[key];
    };

    Cache.prototype.set = function (key, value) {
        this.storage[key] = value;
        this.save();
    };

    Cache.prototype.empty = function () {
        this.storage = {};
        this.save();
    };

    Cache.prototype.save = function () {
        localStorage[this.label] = JSON.stringify(this.storage);
    };

    module.exports = Cache;
}());
