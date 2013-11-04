define(function(require) {
    'use strict';

    var Adapter = require('./adapter'),
        StoreGroup = require('./store_group');

    var adapter = new Adapter('habra');

    var Store = {
        groups: adapter.get('groups') || [],
        visualizationData: [],

        onBuildDone: function() {},

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

        addNode: function(node) {
            this.visualizationData[node.group].nodes.push(node);
        },

        addLink: function(link) {
            this.visualizationData[link.target.group].links.push({
                target: link.target.id,
                source: link.source.id
            });
        },

        done: function(data) {
            adapter.set({
                prefix: 'group',
                key: data.index
            }, this.visualizationData[data.index]);

            adapter.set('groups', this.groups);

            this.onBuildDone.call(this, data.index);
        },

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

        clear: function() {
            adapter.clear();
            this.groups = [];
            this.visualizationData = [];
        }
    };

    return Store;
});
