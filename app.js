'use strict';

define([
    'jquery',
    'tree',
    'ls'
], function($, Tree, LS) {

    /**
     * Инициализирует приложение.
     *
     * @constructor
     * @param {Object} config настройки
     */
    var App = function(config) {
        config = config || {};
        config.userCount = config.userCount || 2;
        config.blackList = config.blackList || [];

        // Извлекаем имена пользователей, с которых мы начнём строить дерево
        this.startUsernames = this.getStartUsernames(config.userCount);
        $(document.body).html('')
            .css({ margin : 0 })
            .show();

        this.usersUrl = config.usersUrl;

        // Игнорируемые
        this.blackList = config.blackList;

        // Визуализация дерева
        this.tree = new Tree;

        // Работа с localStorage
        this.ls = new LS;

        // Очередь детей, о которых надо получить информацию и добавить в дерево
        this.queue = [];

        // Количество запросов в очереди
        this.delay = 0;

        // Величина паузы между запросами к серверу, мс
        this.timeout = 500;
    };

    /**
     * Строит дерево.
     */
    App.prototype.start = function() {
        var self = this;

        // Ищем корни и добавляем их в дерево
        for (var i = 0, len = this.startUsernames.length; i < len; i++) {
            if (self.checkUser(this.startUsernames[i]))
                continue;

            this.getUserInfo(this.startUsernames[i]).then(function(user) {
                // TODO: внутри findRoot не проверяется черный список
                self.findRoot(user).then(function(user) {
                    $.proxy(self.addUser(user), self);
                });
            });
        }

        // Каждые полсекунды будем доставать из очереди пользователя
        setInterval(function() {
            if (self.queue.length > 0) {
                var u = self.queue.shift();

                if (self.checkUser(u))
                    return;

                // Получать о нём информацию и добавлять в дерево
                self.getUserInfo(u).then(function(user) {
                    $.proxy(self.addUser(user), self);
                });
            }
        }, 100);
    };

    /**
     * Проверяет, есть ли пользователь с указанным именем в чёрном списке.
     *
     * @param {string} name имя пользователя
     * @returns {boolean}
     */
    App.prototype.checkUser = function(name) {
        return !! (this.blackList.indexOf(name) > -1);
    };

    /**
     * Добавляет пользователя в дерево, а имена его детей в очередь на обход.
     *
     * @param {Object} user пользователь
     */
    App.prototype.addUser = function(user) {
        this.tree.addNode(user);
        this.tree.update();

        if (user.children.length > 0) {
            for (var i = 0, l = user.children.length; i < l; i++)
                this.queue.push(user.children[i]);
        }
    };

    /**
     * Ищет первого зарегистрировавшегося, с которого началась ветка.
     *
     * @param {Object} user пользователь
     * @return {Object} Deferred-объект
     */
    App.prototype.findRoot = function(user) {
        var d;
        // Если у пользователя есть родитель, значит пока он нас не интересует;
        // добавляем его в хранилище и запрашиваем информацию о его родителе
        if (user.parent) {
            var self = this;
            d = this.getUserInfo(user.parent).then(function(parent) {
                return self.findRoot(parent);
            });
            return d;
        } else { // Если пользователь зарегистрировался по приглашению НЛО
            d = $.Deferred();
            return d.resolve(user);
        }
    };

    /**
     * Находит на странице имена либо всех, либо первых n пользователей.
     *
     * @param {number} n максимальное число имён пользователей
     * @return {Array} имена пользователей
     */
    App.prototype.getStartUsernames = function(n) {
        var users = $('.username a');
        for (var i = 0, usernames = [], n = n || users.length; i < n; i++) {
            usernames.push(users[i].innerHTML);
        }
        return usernames;
    };

    /**
     * Получает информацию о запрашиваемом пользователе либо из хранилища, либо со страницы его профиля.
     *
     * @param {string} username ник пользователя
     * @return {Object} Deferred-объект
     */
    App.prototype.getUserInfo = function(username) {
        var d = $.Deferred(),
            self = this,
            user = this.ls.loadUser(username);

        // Если пользователя нет в кеше, делаем запрос
        if (user === null) {
            setTimeout(function() {
                $.get(self.usersUrl + username + '/').then(function(data) {
                    self.delay--;

                    var user = {};

                    user.name = username; // $(data).find('.user_header h2.username a').text();
                    user.avatar = $(data).find('.user_header .avatar img').attr('src');
                    user.parent = $(data).find('#invited-by').text() || null;
                    user.children = [];

                    // [rel=friend] - иначе при большом кол-ве приглашённых появляется ссылка "показать все"
                    var children = $(data).find('#invited_data_items a[rel=friend]');
                    if (children.length > 0) {
                        for (var i = 0, l = children.length; i < l; i++)
                            user.children.push(children[i].innerHTML);
                    }

                    // Кешируем в localStorage
                    self.ls.saveUser(user);

                    d.resolve(user);
                });
            }, this.delay++ * this.timeout);
        } else {
            d.resolve(user);
        }

        return d;
    };

    return App;

});