(function () {
    'use strict';

    var $ = require('../../vendor/jquery/jquery'),
        Queue = require('./queue'),
        Cache = require('./cache'),
        /* TODO: include into crawler */
        parser = require('./parser'),

        Crawler = function () {
            this.processing_users = new Queue();
            this.processed_users = new Queue();
            this.cache = new Cache('users');
        };

    /* TODO: get rid of it */
    Crawler.prototype.default_retry_timeout = 5000;
    Crawler.prototype.default_max_retry_attempts = 5;

    /*TODO: refactor method*/
    Crawler.prototype.init = function () {
        this.retry_timeout = this.default_retry_timeout;
        this.max_retry_attempts = this.default_max_retry_attempts;

        this.processing_users.empty();
        this.processed_users.empty();
    };

    Crawler.prototype.run = function (user_number) {
        var self = this,
            top_users = parser.getUsersUrls(document, user_number);

        this.init();

        top_users.forEach(function (url) {
            self.handleUser(url);
        });
    };

    /*TODO review method name*/
    Crawler.prototype.sendUser = function (url) {
        var self = this,
            user = this.cache.get(url);

        if (user) {
            if (user.parent_url) {
                this.handleUser(user.parent_url);
            }

            user.children_urls.forEach(function (child) {
                self.handleUser(child);
            });

            if (typeof this.onUserParsed === 'function') {
                this.onUserParsed(user);
            }
        }

        this.processing_users.take(url);
        this.processed_users.put(url);

        if (this.processing_users.isEmpty()) {
            if (typeof this.onLastUserSent === 'function') {
                this.onLastUserSent();
            }
        }
    };

    /*TODO review method name*/
    Crawler.prototype.handleUser = function (url, timeout, attempt) {
        var self = this;

        timeout = timeout !== undefined ? timeout : this.retry_timeout;
        attempt = attempt !== undefined ? attempt : 1;

        if (this.processed_users.contains(url)) {
            return;
        }

        if (this.processing_users.contains(url)) {
            return;
        }

        this.processing_users.put(url);

        if (this.cache.get(url)) {
            setTimeout(function () {
                self.sendUser(url);
            }, 0);

            return;
        }

        $.get(url)
            .done(function (html) {
                var user = parser.getUser(html);

                self.cache.set(url, user);
                self.sendUser(url);
            })
            .fail(function () {
                if (attempt >= this.max_retry_attempts) {
                    self.processing_users.take(url);

                    return;
                }

                setTimeout(function () {
                    self.handleUser(url, this.timeout * 2, attempt + 1);
                }, this.timeout);
            });
    };

    module.exports = Crawler;
}());
