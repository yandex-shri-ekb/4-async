'use strict';


define([
    'jquery',
    'tree',
    'cache',
    'text!main.css',
    'text!main.html'
], function($, Tree, Cache, css, html) {

    /**
     * Приложение.
     * @constructor
     * @param {Object} config настройки
     */
    var App = function(config) {
        this.config = config || {};
        this.config.userCount = config.userCount || 2;
        this.config.blackList = config.blackList || [];

        // Извлекаем имена пользователей, с которых мы начнём строить дерево
        this.startUsernames = this.getStartUsernames(this.config.userCount);
        $('head').append('<style>' + css + '</style>');
        $(document.body).html(html).show();

        this.config.gui = {
            statusText  : $(config.gui.statusText),
            queueLength : $(config.gui.queueLength),
            cacheLength : $(config.gui.cacheLength),
            clearButton : $(config.gui.clearButton)
        };

        this.usersUrl = this.config.usersUrl;

        // Игнорируемые
        this.blackList = this.config.blackList;

        // Визуализация дерева
        this.tree = new Tree;

        // Работа с кешем
        this.cache = new Cache;

        // Очередь детей, о которых надо получить информацию и добавить в дерево
        this.queue = [];

        // Количество запросов в очереди
        this.delay = 0;

        // Величина паузы между запросами к серверу, мс
        this.timeout = 500;

        // Префикс для кеширования данных о пользователях
        this.USER_PREFIX = 'habraUserv2.';

        var self = this;
        this.config.gui.clearButton.on('click', function() {
            self.cache.clear();
            self.updateGui();
            return false;
        });
    };

    /**
     * Строит дерево.
     */
    App.prototype.start = function() {
        var self = this;

        // Ищем корни и добавляем их в дерево
        for (var i = 0, len = this.startUsernames.length; i < len; i++) {
            if (self.blackListCheck(this.startUsernames[i]))
                continue;

            this.getUserInfo(this.startUsernames[i]).then(function(user) {
                // TODO: внутри findRoot не проверяется черный список
                self.findRoot(user).then(function(user) {
                    $.proxy(self.addUser(user), self);
                });
            });
        }

        // Через определённые промежутки времени
        // будем доставать из очереди пользователя
        var step = setInterval(function() {
            if (self.queue.length > 0) {
                var username = self.queue.shift();

                // Некоторые пользователи (BarsMonster) приглашали других дважды (grokru)
                if (self.queue.indexOf(username) > -1) return;

                if (self.blackListCheck(username)) return;

                // Получать о нём информацию и добавлять в дерево
                self.getUserInfo(username).then(function(user) {
                    $.proxy(self.addUser(user), self);
                });
            }
        }, 100);
    };

    /**
     * Проверяет, есть ли пользователь с указанным именем в чёрном списке.
     * @param {string} name имя пользователя
     * @return {boolean}
     */
    App.prototype.blackListCheck = function(name) {
        return this.blackList.indexOf(name) > -1;
    };

    /**
     * Добавляет пользователя в дерево, а имена его детей в очередь на обход.
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
     * @param {Object} user пользователь
     * @return {Object} Deferred-объект
     */
    App.prototype.findRoot = function(user) {
        var d;
        // Если у пользователя есть родитель, значит запрашиваем информацию о его родителе
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
     * @param {number} n максимальное число имён пользователей
     * @return {Array} имена пользователей
     */
    App.prototype.getStartUsernames = function(n) {
        var users = $('.username a'),
            usernames = [];
        n = n || users.length;
        for (var i = 0; i < n; i++) {
            usernames.push(users[i].innerHTML);
        }
        return usernames;
    };

    /**
     * Получает информацию о запрашиваемом пользователе из localStorage, либо со страницы его профиля.
     * @param {string} username ник пользователя
     * @return {Object} Deferred-объект
     */
    App.prototype.getUserInfo = function(username) {
        var d = $.Deferred(),
            self = this,
            user = this.cache.get(this.USER_PREFIX + username);

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
                    self.cache.set(self.USER_PREFIX + user.name, user);

                    self.updateGui();

                    d.resolve(user);
                });
            }, this.delay++ * this.timeout);
        } else {
            d.resolve(user);
        }

        this.updateGui();

        return d;
    };

    /**
     * Обновляет информацию на экране о текущем состоянии дел.
     */
    App.prototype.updateGui = function() {
        var queue = this.delay + this.queue.length;

        this.config.gui.cacheLength.text(this.cache.count());
        if (queue > 0) {
            var status = 'Идёт сканирование';
            $(document.body).removeClass('ready');
        } else {
            var status = 'Дерево построено';
            $(document.body).addClass('ready');
        }
        this.config.gui.statusText.text(status);
        this.config.gui.queueLength.text(queue);
    };

    return App;

});