define(function(require) {
    'use strict';

    var UserProfile = require('app/parser/user_profile'),
        EventEmitter = require('./event_emitter'),
        Store = require('app/store/store');

    /**
     * @class
     * @classdesc Класс реализует получение данных о пользователях с Хабрахабра.
     */
    var Crawler = function() {
        EventEmitter.call(this);
        this.userProfileCache = {};
        this.requestDelay = 0;
    };

    Crawler.prototype = $.extend(EventEmitter.prototype, {
        /**
         * Метод реализует последовательный вызов через заданный интервал
         * 
         * @return {Object} Promise
         */
        wait: function() {
            var d = $.Deferred();
            setTimeout(d.resolve, this.requestDelay);
            this.requestDelay += 250;
            return d.promise();
        },

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
            if(typeof this.userProfileCache[url] !== 'undefined') {
                return {
                    then: function(callback) {
                        callback(self.userProfileCache[url]);
                    }
                };
            }

            return this.wait().then(function() {
                return $.get(url);
            }).then(function (response) {
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
            var self = this;

            group.waitPush();
            
            self.getUserProfile(url).then(function(userProfile){
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
         * @param  {String} url Ссылка на профиль пользователя
         * @return {*}
         */
        start: function(url) {
            var self = this;

            self.getRoot(url).then(function (root) {
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
        }
    });

    return Crawler;
});
