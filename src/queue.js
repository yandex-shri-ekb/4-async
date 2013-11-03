'use strict';

var Queue = function () {
    this.data = [];
};

Queue.prototype.in = function (value) {
    if (this.data.indexOf(value) === -1) {
        this.data.push(value);
    }
};

Queue.prototype.out = function (value) {
    var index;

    while ((index = this.data.indexOf(value)) !== -1) {
        this.data.splice(index, 1);
    }
};

Queue.prototype.isEmpty = function() {
    return this.data.length === 0;
}

Queue.prototype.empty = function() {
    this.data = [];
}

module.exports = Queue;