(function () {
    'use strict';

    var Queue = function () {
        this.storage = [];
        this.labels = {};
    };

    Queue.prototype.contains = function (value) {
        return this.storage.indexOf(value) !== -1;
    };

    Queue.prototype.put = function (value) {
        this.storage.push(value);
    };

    Queue.prototype.take = function (value) {
        var index;

        while (true) {
            index = this.storage.indexOf(value);

            if (index === -1) {
                break;
            }

            this.storage.splice(index, 1);
        }
    };

    Queue.prototype.isEmpty = function () {
        return this.storage.length === 0;
    };

    Queue.prototype.empty = function () {
        this.storage = [];
    };

    Queue.prototype.setLabel = function (value, label) {
        if (!this.contains(value)) {
            throw new Error('Queue does not contains ' + value);
        }

        if (!this.labels[label]) {
            this.labels[label] = [];
        }

        this.labels[label].push(value);
    };

    Queue.prototype.hasLabel = function (value, label) {
        if (!this.contains(value)) {
            throw new Error('Queue does not contains ' + value);
        }

        return this.labels[label] && this.labels[label].indexOf(value) !== -1;
    };

    Queue.prototype.allHaveLabel = function (label) {
        return this.storage.every(function (item) {
            return this.hasLabel(item, label);
        }.bind(this));
    };

    module.exports = Queue;
}());
