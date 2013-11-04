define(function(require) {
    'use strict';

    var UserProfile = function(node) {
        this.parse(node);
    };

    UserProfile.prototype = {
        parse: function(node) {
            var doc = document.implementation.createHTMLDocument('');

            doc.documentElement.innerHTML = node;

            var $html = $(doc),
                $user = $html.find('h2.username a');

            this.url = $user.attr('href'),
            this.username = $user.text(),
            this.avatar = $html.find('img[alt="avatar"]').attr('src').replace(/^\/\//, 'http://'),
            this.parent = $html.find('#invited-by').attr('href'),
            this.childrenUrl = $html.find('#invited_data_items li').not('.banned, .no_icon').children().map(function(i, el) {
                return el.href;
            }).get();
        },

        pure: function(group) {
            return {
                id: this.username,
                avatar: this.avatar,
                group: group
            };
        }
    };

    return UserProfile;
});
