define(function(require) {
    'use strict';

    var UserProfile = require('app/parser/user_profile'),
        EventEmitter = require('app/utils/event_emitter'),
        Config = require('app/config/crawler_config'),
        Queue = require('app/utils/queue'),
        Store = require('app/store/store');

    /**
     * @class
     * @classdesc Класс реализует получение данных о пользователях с Хабрахабра.
     */
    var Crawler = function() {
        EventEmitter.call(this);
        this.userProfileCache = {};
        this.requests = {};
        this.isLaunched = false;
        this.queue = new Queue();
    };

    Crawler.prototype = $.extend({
        /**
         * Метод запрашивает данные о корне для группы пользователей.
         * Пройденные узлы кэшируются.
         * 
         * @param  {String} url Ссылка на профиль пользователя
         * @return {Object}     Promise
         */
        getRoot: function(url) {
            return $.ajax(url, {
                context: this
            }).then(function(response) {
                var userProfile = new UserProfile(response);
                this.userProfileCache[userProfile.url] = userProfile;
                return typeof userProfile['parent'] === 'undefined' ? userProfile : this.getRoot(userProfile.parent);
            });
        },

        /**
         * Метод запрашивает данные о пользователе.
         * Если данные закэшированы, Метод возвращает объект имитирующий Promise.
         * 
         * @param  {String} url Ссылка на профиль пользователя
         * @return {Object}
         */
        getUserProfile: function (url) {
            var self = this;
            if(typeof self.userProfileCache[url] !== 'undefined') {
                return {
                    then: function(callback) {
                        callback(self.userProfileCache[url]);
                    }
                };
            }

            return self.queue.wait().then(function() {
                return self.requests[url] = $.get(url);
            }).then(function (response) {
                delete self.requests[url];
                return new UserProfile(response);
            });
        },

        /**
         * Метод получает данные о ползователе.
         * Рекурсивно вызывается для приглашенных пользователей.
         * 
         * @fires Crawler#get:node
         * 
         * @param  {String} url    Ссылка на профиль пользователя
         * @param  {Object} parent Информация о родителе
         * @param  {Object} group  Группа к которой принадлежит пользователь
         * @return {*}
         */
        detour: function(url, parent, group) {
            if(!this.isLaunched) {
                return;
            }
            
            var self = this;

            group.waitPush();

            self.getUserProfile(url).then(function(userProfile){
                self.queue.diminish();

                /**
                 * Если данный пользователь уже находится в группе, прерывается выполнение фунции.
                 * Данное поведение позволяет разрешить коллизии созданные Хабрахабром.
                 */
                if(group.contains(userProfile.username)) {
                    group.diminish();
                    return;
                }

                group.push(userProfile.username);

                /**
                 * @event Crawler#get:node 
                 * @type {Object}
                 */
                self.emit('get:node', {
                    user: userProfile,
                    parent: parent,
                    group: group.index
                });

                userProfile.childrenUrl.forEach(function(child) {
                    self.detour(child, userProfile, group);
                });
            }, function() {
                group.diminish();
                self.detour(url, parent, group);
            });
        },

        /**
         * Метод запускает обход пользователей начиная с корня группы.
         *
         * @fires Crawler#get:root
         * 
         * @param  {String} username
         * @return {*}
         */
        start: function(username) {
            var self = this;

            self.isLaunched = true;

            self.getRoot(Config.usersUrl + username).then(function (root) {
                var group = Store.createGroup(root.username);

                /**
                 * @event Crawler#get:root 
                 * @type {Object}
                 */
                self.emit('get:root', {
                    user: root,
                    group: group.index
                });

                root.childrenUrl.forEach(function(child) {
                    self.detour(child, root, group);
                });
            });
        },

        /**
         * Метод останавливает обход, очищает очередь запросов, отменяет активные запросы.
         *
         * @return {*}
         */
        stop: function() {
            this.isLaunched = false;
            this.queue.clear();

            var keys = Object.keys(this.requests);
            for (var i = 0, len = keys.length; i < len; i++) {
                this.requests[keys[i]].abort();
            }
        }
    }, EventEmitter.prototype);

    return Crawler;
});
