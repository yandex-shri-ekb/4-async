(function () {
    'use strict';

    var Spinner = function (container) {
        this.stage = 0;
        this.timeout = 200;
        this.container_el = document.querySelector(container);
    };

    Spinner.prototype.stages = ['/', '-', '\\', '|'];

    Spinner.prototype.start = function () {
        var self = this;

        this.stop();

        this.interval = setInterval(function () {
            self.container_el.textContent = self.stages[self.stage];
            self.stage = (self.stage + 1) % self.stages.length;
        }, this.timeout);
    };

    Spinner.prototype.stop = function () {
        clearInterval(this.interval);

        this.container_el.textContent = '';
        this.stage = 0;
    };

    module.exports = Spinner;
}());
