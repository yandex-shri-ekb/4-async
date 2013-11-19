(function () {
    'use strict';

    exports.getUsersUrls = function (html, number) {
        var node_list = html.querySelectorAll('.username > a'),
            node_array = Array.prototype.slice.call(node_list);

        return node_array.slice(0, number).map(function (node) {
            return 'http://habrahabr.ru' + node.getAttribute('href');
        });
    };

    exports.getUser = function (html) {
        var context = document.createElement('div'),
            html_nobr = html.replace(/(\r\n|\n|\r)/gm, ""),
            html_body = new RegExp('<body>(.+)</body>').exec(html_nobr)[1],
            username_el,
            children_list,
            children_array;

        context.innerHTML = html_body;

        username_el = context.querySelector('h2.username');

        if (!username_el) {
            return null;
        }

        children_list = context.querySelectorAll('li:not(.banned) > [rel="friend"]');
        children_array = Array.prototype.slice.call(children_list);

        return {
            url: context.querySelector('.avatar').getAttribute('href'),
            name: username_el.textContent,
            img: context.querySelector('img[alt="avatar"]').getAttribute('src'),
            parent_url: context.querySelector('#invited-by') && context.querySelector('#invited-by').getAttribute('href'),
            children_urls: children_array.map(function (child) {
                return child.getAttribute('href');
            })
        };
    };
}());
