'use strict';

var Cache = function (key) {
    this.key = key;
    this.cache = localStorage[this.key] ? JSON.parse(localStorage[this.key]) : {};
};

Cache.prototype.get = function (key) {
    return this.cache[key];
};

Cache.prototype.set = function (key, value) {
    this.cache[key] = value;
    this.save();
};

Cache.prototype.clear = function () {
    this.cache = {};
    this.save();
};

Cache.prototype.save = function () {
    localStorage[this.key] = JSON.stringify(this.cache);
};

module.exports = Cache;