(function (global) {
    'use strict';

    var Parser = function (document) {
        this.document = document;
    };

    Parser.prototype.getUsersUrls = function (number) {
        return this.document.find('.username > a:lt(' + number + ')').map(function () {
            return 'http://habrahabr.ru' + $(this).attr('href');
        }).toArray()
    };

    Parser.prototype.getUser = function () {
        return {
            url: this.document.find('.avatar').attr('href'),
            name: this.document.find('h2.username').text(),
            img: this.document.find('img[alt="avatar"]').attr('src'),
            parent_url: this.document.find('#invited-by').attr('href'),
            children_urls: this.document.find('[rel="friend"]').map(function () {
                return $(this).attr('href');
            }).toArray()
        };
    }

    global.Parser = Parser;
}(this));
