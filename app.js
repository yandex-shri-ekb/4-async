'use strict';

define('app', ['jquery', 'graph', 'user', 'storage'], function($, Graph, User, storage) {
    /**
     * @class App
     *
     * @constructor
     * @param {Object} options
     */
    var App = function(options) {
        var app = this,
            defaults = {
                // частота опроса
                sampleRate: 2500,
                // тестовый режим
                testMode: false
            };

        this.options = $.extend(defaults, options);

        // очередь
        this.queue = [];

        this.nTicks = 0;
    };

    /**
     * @param {Array} initUsers
     */
    App.prototype.init = function(initUsers) {
        var app = this,
            $body = $(document.body),
            w = 1200,
            h = 800,
            $canvas = $('<div id="canvas" style="margin: 0 auto;"></div>')
                .css('width', w + 'px')
                .css('height', h + 'px'),
            $controls = $('<div id="controls"></div>');

        var $stop = $('<button id="btn-stop">stop</button>')
            .appendTo($controls)
            .on('click', function() {
                clearInterval(app.mainLoop);
                return false;
            });

        $body
            // элементы управления
            .append($controls)
            // и подготовим холст
            .append($canvas);

        var root = new User('НЛО', '/');

        app.queue = [];
        app.graph = new Graph($canvas.get(0), {w:w, h:h});
        app.graph.add(root);

        for(var i = 0, l = initUsers.length; i < l; i++) {
            app.queue.push(initUsers[i]);
            app.graph.add(initUsers[i]);
        }

        app.graph.update();

        if(app.options.testMode) {
            app.graph.linkNodes(root, initUsers[0]);
            app.graph.linkNodes(initUsers[0], initUsers[1]);
            app.graph.update();

            return;
        }

        /**
         */
        function onMainLoop() {
            app.tick();
        }

        // start timer
        app.mainLoop = setInterval(onMainLoop, app.options.sampleRate);
        onMainLoop();
    };

    /**
     */
    App.prototype.tick = function() {
        var app = this;
        app.nTicks++;

        if(app.queue.length === 0) {
            return;
        }

        var user = app.queue.shift();
        app.processUser(user);
    };

    /**
     * @param {User} user
     */
    App.prototype.processUser = function(user) {
        var app = this;

        console.log(user);

        // получаем информацию о пользователе
        $.get(user.url, function(response) {
            var $page = $(response),
                $invitedBy = $('#invited-by', $page),
                invitedByName = '',
                invitedByUrl = '',
                invitedByUser = null;

            if($invitedBy.length === 0) {
                // наверное НЛО
                invitedByUser = app.getUser('НЛО');
            }
            else {
                invitedByName = $invitedBy.text().trim() || null;
                invitedByUrl = $invitedBy.attr('href') || null;
                invitedByUser = app.getUser(invitedByName);
            }

            if(!invitedByUser) {
                invitedByUser = new User(invitedByName, invitedByUrl);
                app.addToQueue(invitedByUser);
                app.storeUser(invitedByUser);
            }

            user.avatar = $('.user_header .avatar img', $page).attr('src');
            user.invitedBy = invitedByUser;
            user.isLoaded = true;
            invitedByUser.addFriend(user);
            app.linkUsers(invitedByUser, user);
            app.graph.update();

            // друзьяши
            var $friends = $('#invited_data_items li a[rel="friend"]', $page);
            $friends.each(function() {
                var $friend = $(this),
                    friendName = $friend.text().trim(),
                    friendUrl = $friend.attr('href'),
                    friend = app.getUser(friendName);

                if(!friend) {
                    friend = new User(friendName, friendUrl);
                    app.addToQueue(friend);
                    app.storeUser(friend);
                }

                friend.invitedBy = user;
                user.addFriend(friend);
                app.linkUsers(user, friend);
                app.graph.update();
            });
        });
    };

    /**
     * @param {User} user
     */
    App.prototype.addToQueue = function(user) {
        this.queue.push(user);
    };

    /**
     * @param {User} user
     */
    App.prototype.storeUser = function(user) {
        this.graph.add(user);
    };


    /**
     * @param {User} user1
     * @param {User} user2
     */
    App.prototype.linkUsers = function(user1, user2) {
        this.graph.linkNodes(user1, user2);
    };

    /**
     * @param {string} nickname
     */
    App.prototype.getUser = function(nickname) {
        return this.graph.find(nickname);
    };

    return App;
});