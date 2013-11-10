'use strict';

define('app', ['jquery', 'graph', 'user', 'storage'], function($, Graph, User, storage) {
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

        // флаг остановки
        this.isStoped = false;

        this.nTicks = 0;
    };

    /**
     * @param {Array} initUsers
     */
    App.prototype.init = function(initUsers) {
        var app = this,
            $body = $(document.body),
            $canvas = $('<div id="canvas"></div>'),
            $controls = $('<div id="controls"></div>');

        $('<button id="btn-stop">stop</button>')
            .appendTo($controls)
            .on('click', function() {
                app.isStoped = true;
                return false;
            });

        $('<button id="btn-continue">continue</button>')
            .appendTo($controls)
            .on('click', function() {
                app.isStoped = false;
                app.tick();
                return false;
            });

        $body
            // элементы управления
            .append($controls)
            // и подготовим холст
            .append($canvas);

        // Добавим НЛО
        var root = new User('НЛО', '/');
        root.avatar = '/favicon.ico';
        app.queue = [];
        app.graph = new Graph($canvas.get(0), {});
        app.addToGraph(root, 40);

        for(var i = 0, l = initUsers.length; i < l; i++) {
            app.queue.push(initUsers[i]);
            app.addToGraph(initUsers[i]);
        }

        app.graph.update();

        // start loop
        app.tick();
    };

    /**
     */
    App.prototype.tick = function() {
        var app = this;

        if(app.isStoped) {
            return;
        }

        app.nTicks++;

        var user = app.queue.shift();
        if(user === undefined) {
            return;
        }

        console.log('Request for ' + user.nickname);
        app.requestUser(user).then(function(user) {
            var node = app.findNode(user) || app.addToGraph(user),
                parentNode = app.findNode(user.invitedBy);

            console.log(user);

            if(parentNode !== null) {
                app.graph.linkNodes(node, parentNode).update();
            }
            else {
                app.addToQueue(user.invitedBy, 'high');
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
            setTimeout(function() {
                app.tick();
            }, nextThrough)
        });
    };

    /**
     * @param {User} user
     */
    App.prototype.requestUser = function(user) {
        // кеш
        var cachedValue = storage.load(user.nickname, 'user.');

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
                    user.markAsDeleted();
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
     * @param {User} user
     */
    App.prototype.findNode = function(user) {
        return this.graph.find(user.nickname);
    };

    return App;
});