(function () {
    'use strict';

    var $ = require('../../vendor/jquery/jquery');

    module.exports = {
        getUsersUrls: function (html, number) {
            return $(html).find('.username > a:lt(' + number + ')').map(function () {
                return 'http://habrahabr.ru' + $(this).attr('href');
            }).toArray();
        },

        getUser: function (html) {
            var $html = $(html),
                $username = $html.find('h2.username');

            if (!$username) {
                return null;
            }

            return {
                url: $html.find('.avatar').attr('href'),
                name: $username.text(),
                img: $html.find('img[alt="avatar"]').attr('src'),
                parent_url: $html.find('#invited-by').attr('href'),
                children_urls: $html.find('li').not('.banned').find('[rel="friend"]').map(function () {
                    return $(this).attr('href');
                }).toArray()
            };
        }
    };
}());
