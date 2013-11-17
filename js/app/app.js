'use strict';

define(['jquery', 'app/graph', 'app/user', 'app/user_manager', 'app/storage'], function($, Graph, User, userManager, storage) {
    /** @class App */

    /**
     * @constructor
     * @param {Object} options
     */
    var App = function(options) {
        var defaults = {
            // частота опроса
            sampleRate: 650
        };

        this.options = $.extend(defaults, options);

        // очередь
        this.queue = [];

        // граф пользователей
        this.graph = null;

        // флаг остановки
        this.isStoped = false;

        // флаг остановки
        this.isStarted = false;
    };

    /**
     * @param {jQuery} $canvas
     * @param {User[]} users
     */
    App.prototype.init = function($canvas, users) {
        var app = this;

        app.graph = new Graph($canvas.get(0), {});

        app.reset(users);
    };

    /**
     * @param {User[]} users
     */
    App.prototype.reset = function(users) {
        var app = this;

        app.queue = [];

        app.graph.clear();
        app.graph.update();

        // Добавим НЛО
        app.addUFO();

        for(var i = 0, l = users.length; i < l; i++) {
            app.addToQueue(users[i], 'low');
            app.addToGraph(users[i]);
        }

        app.graph.update();
    };

    /**
     */
    App.prototype.addUFO = function() {
        var app = this;

        var root = new User('НЛО', '/');
        root.avatar = '/favicon.ico';
        app.addToGraph(root, 40);
    };

    /**
     */
    App.prototype.tick = function() {
        var app = this;

        if(app.isStoped) {
            return;
        }

        var user = app.queue.shift();
        if(user === undefined) {
            setTimeout(function() {app.tick();}, app.options.sampleRate);
            return;
        }

        console.log('Request for ' + user.nickname);
        app.requestUser(user).then(function(user) {
            var node = app.findNode(user) || app.addToGraph(user);

            if(user.invitedBy !== null) {
                var parentNode = app.findNode(user.invitedBy);
                if(parentNode !== null) {
                    app.graph.linkNodes(node, parentNode).update();
                }
                else {
                    app.addToQueue(user.invitedBy, 'high');
                }
            }

            user.friends.forEach(function(f) {
                var friendNode = app.findNode(f);

                if(friendNode !== null) {
                    app.graph.linkNodes(friendNode, node).update();
                }
                else {
                    app.addToQueue(f, 'low');
                }
            });

            var nextThrough = user.__storage ? 150 : app.options.sampleRate;
            setTimeout(function() {app.tick();}, nextThrough)
        });
    };

    /**
     * @param {User} user
     */
    App.prototype.requestUser = function(user) {
        // кеш
        var cachedValue = storage.load(user.nickname, 'user.', userManager);

        var d = $.Deferred();
        if(cachedValue !== null) {
            cachedValue.__storage = true;
            d.resolve(cachedValue);
            console.log('loaded from cache');
        }
        else {
            // получаем информацию о пользователе
            $.get(user.url, function(response) {
                var $page = $(response);

                // Страница пользователя заблокирована
                if($('h1', $page).text() == 'Доступ закрыт') {
                    userManager.markAsDeleted(user);
                }
                else {
                    // если мы забирали пользователя не со страницы другого пользователя
                    if(user.invitedBy === null) {
                        var $invitedBy = $('#invited-by', $page),
                            invitedByName = '',
                            invitedByUrl = '';

                        if($invitedBy.length === 0) {
                            // наверное НЛО
                            invitedByName = 'НЛО';
                        }
                        else {
                            invitedByName = $invitedBy.text().trim() || null;
                            invitedByUrl = $invitedBy.attr('href') || null;
                        }

                        user.invitedBy = new User(invitedByName, invitedByUrl);
                    }

                    // аватарка
                    user.avatar = $('.user_header .avatar img', $page).attr('src');

                    // друзьяши, куда без них
                    var $friends = $('#invited_data_items li a[rel="friend"]', $page);
                    user.friends = $friends.map(function() {
                        var $friend = $(this),
                            friendName = $friend.text().trim(),
                            friendUrl = $friend.attr('href'),
                            friend = new User(friendName, friendUrl);

                        friend.invitedBy = new User(user.nickname, user.url);

                        return friend;
                    }).get();
                }

                storage.save(user.nickname, user, 'user.');
                console.log('saved to cache');
                d.resolve(user);
            });
        }

        return d.promise();
    };

    /**
     * @param {User} user
     * @param {string} [priority]
     */
    App.prototype.addToQueue = function(user, priority) {
        priority = priority || 'low';
        if(priority === 'high') {
            this.queue.unshift(user);
        }
        else {
            this.queue.push(user);
        }
    };

    /**
     * @param {User} user
     * @param {int} [size]
     * @param {Object} [options]
     */
    App.prototype.addToGraph = function(user, size, options) {
        return this.graph.add(user.nickname, user.avatar, size, options);
    };


    /**
     * @param {User} user1
     * @param {User} user2
     */
    App.prototype.linkUsers = function(user1, user2) {
        var node1 = this.findNode(user1),
            node2 = this.findNode(user2);

        if(node1 && node2) {
            this.graph.linkNodes(node1, node2);
        }
    };

    /**
     */
    App.prototype.refresh = function() {
        return this.graph.update();
    };

    /**
     * @param {User} user
     */
    App.prototype.findNode = function(user) {
        return this.graph.find(user.nickname);
    };

    /**
     */
    App.prototype.start = function() {
        if(this.isStarted) {
            return;
        }

        this.isStarted = true;
        this.tick();
    };

    /**
     */
    App.prototype.resume = function() {
        if(!this.isStoped || !this.isStarted) {
            return;
        }

        this.isStoped = false;
        this.tick();
    };

    /**
     */
    App.prototype.stop = function() {
        this.isStoped = true;
    };

    return App;
});