define(function(require) {
    'use strict';

    var Adapter = require('./adapter'),
        EventEmitter = require('app/utils/event_emitter'),
        StoreGroup = require('./store_group');

    var Store = function() {
        EventEmitter.call(this);
        this.adapter = new Adapter('habra');
        this.completeGroups = this.adapter.get('groups') || [];
        this.groups = [];
        this.visualizationData = [];
    };

    Store.prototype = $.extend({
        /**
         * Метод инициализирует новую группу пользователей.
         * 
         * @param  {Object} root Корень группы (пользователь)
         * @return {Object}      Группа
         */
        createGroup: function(root) {
            var groupIndex = this.groups.length,
                group = new StoreGroup(groupIndex, root);

            this.groups.push(group.usernames);
            this.visualizationData[groupIndex] = {
                nodes: [],
                links: []
            };

            group.on('done', $.proxy(this, 'done'));

            return group;
        },

        /**
         * Метод кэширует узел визуализации.
         * 
         * @param  {Object} node
         * @return {*}
         */
        addNode: function(node) {
            this.visualizationData[node.group].nodes.push(node);
        },

        /**
         * Метод кэширует связь между узлами визуализации.
         * 
         * @param  {Object} link
         * @return {*}
         */
        addLink: function(link) {
            this.visualizationData[link.target.group].links.push({
                target: link.target.id,
                source: link.source.id
            });
        },

        /**
         * @fires Store#update:groups
         */
        updateInfo: function() {
            /**
             * @event Store#update:groups
             * @type {Number}
             */
            this.emit('update:groups', this.completeGroups.length);
        },

        /**
         * Обработчик события "done" вызываемого в StoreGroup.
         * В localStorage помещается данные визуализации группы и список групп.
         *
         * @fires Store#done:build
         * 
         * @param  {Object}   data 
         * @return {*}
         */
        done: function(data) {
            this.completeGroups.push(this.groups[data.index]);

            this.adapter.set({
                prefix: 'group',
                key: this.completeGroups.length - 1
            }, this.visualizationData[data.index]);

            this.adapter.set('groups', this.completeGroups);

            /**
             * @event Store#done:build
             * @type {Number}
             */
            this.emit('done:build', data.index);
            this.updateInfo();
        },

        /**
         * Метод ищет закэшированную группу пользователя.
         * 
         * @param  {String} username
         * @return {*}
         */
        getGroup: function (username) {
            for(var i = 0, len = this.completeGroups.length; i < len; i++) {
                if (this.completeGroups[i].indexOf(username) > -1) {
                    return this.adapter.get({
                        prefix: 'group',
                        key: i
                    });
                }
            }
        },

        /**
         * Метод очищает localStorage, закэшированные группы и данные визуализации.
         * 
         * @return {*}
         */
        reset: function() {
            this.adapter.clear();
            this.groups.length = 0;
            this.completeGroups.length = 0;
            this.visualizationData.length = 0;

            this.updateInfo();
        },

        /**
         * Метод удаляет группы, формирование которых не было завершено.
         * 
         * @return {*}
         */
        clear: function() {
            this.completeGroups = this.adapter.get('groups') || [];
            this.groups.length = 0;
            this.visualizationData.length = 0;
        }
    }, EventEmitter.prototype);

    return new Store();
});
