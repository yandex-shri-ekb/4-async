(function () {
    'use strict';

    var Crawler = require('../common/crawler'),
        Builder = require('../common/builder'),

        crawler = new Crawler(),
        builder = new Builder();

    crawler.onUserParsed = function (user) {
        builder.addUser(user);
    };

    crawler.onLastUserSent = function () {
        builder.stop();
    };

    builder.start();
    crawler.run(2);
}());
