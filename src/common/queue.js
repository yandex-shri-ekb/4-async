(function () {
    'use strict';

    var Queue = function () {
        this.data = [];
    };

    Queue.prototype.put = function (value) {
        if (this.data.indexOf(value) === -1) {
            this.data.push(value);
        }
    };

    Queue.prototype.take = function (value) {
        var index;

        while (true) {
            index = this.data.indexOf(value);

            if (index === -1) {
                break;
            }

            this.data.splice(index, 1);
        }
    };

    Queue.prototype.isEmpty = function () {
        return this.data.length === 0;
    };

    Queue.prototype.empty = function () {
        this.data = [];
    };

    module.exports = Queue;
}());
