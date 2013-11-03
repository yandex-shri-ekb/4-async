'use strict';

var Spinner = function (container) {
    this.stage = 0;
    this.timeout = 200;
    this.container = container;
};

Spinner.prototype.stages = ['/', '-', '\\', '|'];

Spinner.prototype.start = function () {
    var self = this;

    this.stop();

    this.interval = setInterval(function () {
        self.container.innerHTML = self.stages[self.stage];
        self.stage = (self.stage + 1) % self.stages.length;
    }, this.timeout);
};

Spinner.prototype.stop = function () {
    clearInterval(this.interval);

    this.container.innerHTML = '';
    this.stage = 0;
};

module.exports = Spinner;