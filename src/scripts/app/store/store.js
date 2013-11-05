define(function(require) {
    'use strict';

    var Adapter = require('./adapter'),
        StoreGroup = require('./store_group');

    var adapter = new Adapter('habra');

    var Store = {
        groups: adapter.get('groups') || [],
        visualizationData: [],

        onBuildDone: function() {},

        /**
         * Функция инициализирует новую группу пользователей.
         * 
         * @param  {Object} root Корень группы (пользователь)
         * @return {Object}      Группа
         */
        createGroup: function(root) {
            var groupIndex = this.groups.length;
            var group = new StoreGroup(groupIndex, root);
            this.groups.push(group.usernames);
            this.visualizationData[groupIndex] = {
                nodes: [],
                links: []
            };
            group.on('done', $.proxy(this.done, this));
            return group;
        },

        /**
         * Функция кэширует узел визуализации.
         * 
         * @param  {Object} node
         * @return {*}
         */
        addNode: function(node) {
            this.visualizationData[node.group].nodes.push(node);
        },

        /**
         * Функция кэширует связь между узлами визуализации.
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
         * Обработчик события "done" вызываемого в StoreGroup.
         *
         * В localStorage помещается данные визуализации группы и список групп.
         * 
         * @param  {Object}   data 
         * @return {*}
         */
        done: function(data) {
            adapter.set({
                prefix: 'group',
                key: data.index
            }, this.visualizationData[data.index]);

            adapter.set('groups', this.groups);

            this.onBuildDone.call(this, data.index);
        },

        /**
         * Функция ищет закэшированную группу пользователя.
         * 
         * @param  {String} username
         * @return {*}
         */
        getGroup: function (username) {
            for(var i = 0, len = this.groups.length; i < len; i++) {
                if (this.groups[i].indexOf(username) > -1) {
                    return adapter.get({
                        prefix: 'group',
                        key: i
                    });
                }
            }
        },

        /**
         * Функция очищает localStorage, закэшированные группы и данные визуализации.
         * 
         * @return {*}
         */
        clear: function() {
            adapter.clear();
            this.groups = [];
            this.visualizationData = [];
        }
    };

    return Store;
});
