(function () {
    'use strict';

    var $ = require('../../vendor/jquery/jquery'),
        Queue = require('../common/queue'),
        Parser = require('../common/parser'),
        Cache = require('../common/cache'),

        queue = new Queue(),
        parsed_users,
        cache = new Cache('users'),
        retry_timeout = 5000,
        increaseTimeout = function (t) {
            return t * 2;
        },
        max_retry_attempts = 5,

        sendUser,
        handleUser,
        buildUserTree;

    sendUser = function (url) {
        var user = cache.get(url);

        if (user) {
            if (user.parent_url) {
                handleUser(user.parent_url);
            }

            user.children_urls.forEach(function (child) {
                handleUser(child);
            });

            chrome.runtime.sendMessage({
                action: "userParsed",
                user: user
            });
        }

        queue.take(url);
        parsed_users.push(url);

        if (queue.isEmpty()) {
            chrome.runtime.sendMessage({
                action: "lastUserSent"
            });
        }
    };

    handleUser = function (url, timeout, attempt) {
        timeout = timeout !== undefined ? timeout : retry_timeout;
        attempt = attempt !== undefined ? attempt : 1;

        if (parsed_users.indexOf(url) !== -1) {
            return;
        }

        queue.put(url);

        if (cache.get(url)) {
            setTimeout(function () {
                sendUser(url);
            }, 0);
            return;
        }

        $.get(url)
            .done(function (html) {
                var user = new Parser($(html)).getUser();

                cache.set(url, user);
                sendUser(url);
            })
            .fail(function () {
                if (attempt >= max_retry_attempts) {
                    queue.take(url);
                    return;
                }

                setTimeout(function () {
                    handleUser(url, increaseTimeout(timeout), attempt + 1);
                }, timeout);
            });
    };

    buildUserTree = function (user_number) {
        queue.empty();
        parsed_users = [];

        new Parser($(document)).getUsersUrls(user_number).forEach(function (url) {
            handleUser(url);
        });
    };

    chrome.extension.sendRequest({});

    chrome.runtime.onMessage.addListener(
        function (request) {
            switch (request.action) {
            case 'buildUserTree':
                buildUserTree(request.user_number);
                break;
            }
        }
    );
}());
