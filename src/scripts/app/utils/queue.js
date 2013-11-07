define(function(require) {
    'use strict';

    var Config = require('app/config/crawler_config');

    var Queue = function() {
        this.requestDelay = 0;
        this.queue = [];
    };

    Queue.prototype = {
        wait: function() {
            var d = $.Deferred();
            this.queue.push(setTimeout(d.resolve, Config.requestDelay * this.requestDelay++));
            return d.promise();
        },

        diminish: function() {
            this.requestDelay--;
        },

        clear: function() {
            for (var i = 0, len = this.queue.length; i < len; i++) {
                clearTimeout(this.queue[i]);
            }

            this.requestDelay = 0;

            return this;
        }
    };

    return Queue;
});
