(function () {
    'use strict';

    var $ = require('../../vendor/jquery/jquery'),
        Spinner = require('../common/spinner'),
        Tree = require('../common/tree'),

        spinner = new Spinner($('.spinner').get(0)),
        users = [],
        tree = new Tree('.container');

    function addUser(new_user) {
        new_user.children = [];

        users.forEach(function (user) {
            if (!user.children) {
                user.children = [];
            }

            if (user.url === new_user.parent_url && user.children.indexOf(new_user) === -1) {
                user.children.push(new_user);
            }

            if (new_user.children_urls.indexOf(user.url) !== -1 && new_user.children.indexOf(user) === -1) {
                new_user.children.push(user);
            }
        });

        users.push(new_user);
    }

    function getRootUsers() {
        return {
            name: '',
            children: users.filter(function (user) {
                return !user.parent_url;
            })
        };
    }

    $('button').on('click', function () {
        $('.setup').hide();
        $('.tree').show();

        spinner.start();

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "buildUserTree",
                user_number: $('input').val()
            });
        });
    });

    chrome.runtime.onMessage.addListener(
        function (request) {
            switch (request.action) {
            case 'userParsed':
                addUser(request.user);
                tree.update(getRootUsers());
                break;
            case 'lastUserSent':
                spinner.stop();
                $('.progress').hide();
                $('.done').show();
                break;
            }
        }
    );
}());
