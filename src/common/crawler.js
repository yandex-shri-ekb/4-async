(function () {
    'use strict';

    var Queue = require('./queue'),
        Cache = require('./cache'),

        parser = require('./parser'),
        async = require('./async'),

        Crawler = function () {
            this.cache = new Cache('users');
            this.queue = new Queue();

            this.retry_timeout = 5000;
            this.max_retry_attempts = 5;
        };

    Crawler.prototype.run = function (user_number) {
        this.queue.empty();

        parser.getUsersUrls(document, user_number).forEach(function (url) {
            this.handleUser(url);
        }.bind(this));
    };

    Crawler.prototype.processUser = function (user) {
        if (user) {
            if (user.parent_url) {
                this.handleUser(user.parent_url);
            }

            user.children_urls.forEach(function (child) {
                this.handleUser(child);
            }.bind(this));

            if (typeof this.onUserParsed === 'function') {
                this.onUserParsed(user);
            }
        }

        this.queue.setLabel(user.url, 'processed');

        if (this.queue.allHaveLabel('processed')) {
            if (typeof this.onLastUserSent === 'function') {
                this.onLastUserSent();
            }
        }
    };

    Crawler.prototype.handleUser = function (url) {
        var self = this;

        if (this.queue.contains(url)) {
            return;
        }

        this.queue.put(url);

        async.request(
            url,
            this.cache,
            function (html) {
                self.processUser(parser.getUser(html));
            },
            function () {
                self.queue.take(url);
            },
            function (attempt) {
                return attempt < self.max_retry_attempts ? self.retry_timeout * attempt : false;
            }
        );
    };

    module.exports = Crawler;
}());
