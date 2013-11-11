(function () {
    'use strict';

    var $ = require('../../vendor/jquery/jquery'),
        Queue = require('../common/queue'),
        Cache = require('../common/cache'),
        parser = require('../common/parser'),

        processing_users = new Queue(),
        processed_users = new Queue(),
        cache = new Cache('users'),

        retry_timeout = 5000,
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

        processing_users.take(url);
        processed_users.put(url);

        if (processing_users.isEmpty()) {
            chrome.runtime.sendMessage({
                action: "lastUserSent"
            });
        }
    };

    handleUser = function (url, timeout, attempt) {
        timeout = timeout !== undefined ? timeout : retry_timeout;
        attempt = attempt !== undefined ? attempt : 1;

        if (processed_users.contains(url) || processing_users.contains(url)) {
            return;
        }

        processing_users.put(url);

        if (cache.get(url)) {
            setTimeout(function () {
                sendUser(url);
            }, 0);

            return;
        }

        $.get(url)
            .done(function (html) {
                var user = parser.getUser(html);

                cache.set(url, user);
                sendUser(url);
            })
            .fail(function () {
                if (attempt >= max_retry_attempts) {
                    processing_users.take(url);

                    return;
                }

                setTimeout(function () {
                    handleUser(url, timeout * 2, attempt + 1);
                }, timeout);
            });
    };

    buildUserTree = function (user_number) {
        var top_users = parser.getUsersUrls(document, user_number);

        processing_users.empty();
        processed_users.empty();

        top_users.forEach(function (url) {
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
