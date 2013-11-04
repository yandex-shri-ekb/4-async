define(function(require) {
    'use strict';

    var EventTarget = require('app/event_target');

    var StoreGroup = function(index, username) {
        EventTarget.call(this);
        this.usernames = [username] || [];
        this.index = index || 0;
        this.counter = 0;
    };

    StoreGroup.prototype = $.extend(EventTarget.prototype, {
        waitPush: function() {
            return ++this.counter;
        },

        diminish: function() {
            return --this.counter;
        },

        push: function (username) {
            this.usernames.push(username);

            --this.counter === 0 && this.trigger('done', {
                index: this.index,
                usernames: this.usernames
            });

            return this;
        },

        contains: function(username) {
            return this.usernames.indexOf(username) > -1;
        }
    });

    return StoreGroup;
});
