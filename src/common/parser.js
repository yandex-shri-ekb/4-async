(function () {
    'use strict';

    var $ = require('../../vendor/jquery/jquery'),

        Parser = function (document) {
            this.document = document;
        };

    Parser.prototype.getUsersUrls = function (number) {
        return this.document.find('.username > a:lt(' + number + ')').map(function () {
            return 'http://habrahabr.ru' + $(this).attr('href');
        }).toArray();
    };

    Parser.prototype.getUser = function () {
        var $username = this.document.find('h2.username');

        if ($username) {
            return null;
        }

        return {
            url: this.document.find('.avatar').attr('href'),
            name: $username.text(),
            img: this.document.find('img[alt="avatar"]').attr('src'),
            parent_url: this.document.find('#invited-by').attr('href'),
            children_urls: this.document.find('li').not('.banned').find('[rel="friend"]').map(function () {
                return $(this).attr('href');
            }).toArray()
        };
    };

    module.exports = Parser;
}());
