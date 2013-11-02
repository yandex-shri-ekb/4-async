'use strict';

define([
    'jquery',
    'graph',
    'ls'
], function($, Graph, LS) {

    /**
     * Инициализирует приложение.
     *
     * @constructor
     * @param {Object} config настройки
     */
    var App = function(config) {
        config = config || {};
        config.userCount = config.userCount || 5;
        config.blackList = config.blackList || [];

        // Извлекаем имена пользователей, с которых мы начнём строить дерево
        this.startUsernames = this.getStartUsernames(config.userCount);
        $('html').css('height', '100%');
        $(document.body).html('')
            .css('height', '100%')
            .show();

        this.usersUrl = config.usersUrl;

        // Игнорируемые
        this.blackList = config.blackList;

        // Визуализация графа
        this.graph = new Graph;

        // Работа с localStorage
        this.ls = new LS;

        // Сколько коренных пользователей должно найтись
        // Число может меняться, если присутствуют пользователи из черного списка
        this.rootsMustFind = config.userCount;

        // Сколько коренных пользователей найдено
        this.rootsFound = 0;

        // Очередь детей, о которых надо получить информацию и добавить на граф
        this.queue = [];

        // Хранение полученных данных о пользователе
        this.storage = {};
    };

    /**
     * Строит граф.
     */
    App.prototype.start = function() {
        var self = this;

        // Ищем корни
        for (var i = 0, len = this.startUsernames.length; i < len; i++) {
            // Если пользователь в чёрном списке, пропускаем его
            if (self.blackList.indexOf(this.startUsernames[i]) > -1) {
                this.rootsMustFind--;
                continue;
            }

            this.getUserInfo(this.startUsernames[i]).then(function(user) {
                self.findRoot(user);
            });
        }

        // Когда найдутся все корни
        this.thatsAll = setInterval(function() {
            if (self.rootsFound  >= self.rootsMustFind) {
                var u = self.queue.shift();
                if (u) {
                    self.getUserInfo(u).then(function(user) {
                        self.addToStorage(user);
                    });
                } else {
                    // Очередь может быть пуста потому что новые данные находятся в процессе получения,
                    // поэтому подстраховываемся
                    setTimeout(function() {
                        if (self.queue.length === 0) {
                            clearInterval(self.thatsAll);
                            self.thatsAll = true;
                        }
                    }, 2000);
                }
            }
        }, 500);

        var endGraphUpdate = setInterval(function() {
            self.updateGraph();
            if (self.thatsAll === true) {
                clearInterval(endGraphUpdate);
            }
        }, 2000);
    };

    /**
     * Обновляет граф.
     */
    App.prototype.updateGraph = function() {
        for (var u in this.storage) {
            var user = this.storage[u];

            if (self.rootsFound >= self.rootsMustFind)
                delete this.storage[u];

            this.graph.addNode(user);
            this.graph.addLink(user.name, user.parent ? user.parent : 'НЛО');
        }
        this.graph.update();
    };

    /**
     * Ищет первого зарегистрировавшегося, с которого началась ветка.
     *
     * @param {Object} user пользователь
     * @return {Object} Deferred-объект
     */
    App.prototype.findRoot = function(user) {
        this.addToStorage(user);
        // Если у пользователя есть родитель, значит пока он нас не интересует;
        // добавляем его в хранилище и запрашиваем информацию о его родителе
        if (user.parent) {
            var self = this;
            var d = this.getUserInfo(user.parent).then(function(parent) {
                return self.findRoot(parent);
            });
            return d;
        } else { // Если пользователь зарегистрировался по приглашению НЛО
            this.rootsFound++;
            var d = $.Deferred();
            return d.resolve(user);
        }
    };

    /**
     * Добавляет пользователя в хранилище.
     *
     * @param {Object} user пользователь
     */
    App.prototype.addToStorage = function(user) {
        this.storage[user.name] = user;
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
        if (user === null) {
            d = $.get(this.usersUrl + username + '/').then(function(data) {
                var user = {};

                user.name = $(data).find('.user_header h2.username a').text();
                user.avatar = $(data).find('.user_header .avatar img').attr('src');
                user.parent = $(data).find('#invited-by').text() || null;

                // [rel=friend] - иначе при большом кол-ве приглашённых появляется ссылка "показать все"
                var children = $(data).find('#invited_data_items a[rel=friend]');

                if (children.length > 0) {
                    user.children = [];
                    for (var i = 0, len = children.length; i < len; i++) {
                        self.queue.push(children[i].innerHTML); // добавляем детей в отдельную очередь
                        user.children.push(children[i].innerHTML);
                    }
                }

                // Кешируем в localStorage
                self.ls.saveUser(user);

                return user;
            }).promise();
            return d;
        } else {
            if (user.children) {
                for (var i = 0, len = user.children.length; i < len; i++) {
                    this.queue.push(user.children[i]); // добавляем детей в отдельную очередь
                }
            }
            return d.resolve(user);
        }
    };

    return App;

});