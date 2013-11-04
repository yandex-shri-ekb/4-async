define(function(require) {
    'use strict';

    var $ = require('jquery'),
        Control = require('app/ui/control'),
        Crawler = require('app/crawler'),
        Store = require('app/store/store'),
        Visualizer = require('app/visualizer');

    var start = function(userList) {
        var ControlElements = Control.cacheElements(),
            visualizer = new Visualizer(),
            crawler = new Crawler();

        crawler.on('get:root', function(data) {
            var node = data.user.pure(data.group);
            visualizer.addNode(node);
            Control.startBuild(data.group);
        });

        crawler.on('get:node', function(data) {
            var node = data.user.pure(data.group);
            visualizer.addNode(node);
            visualizer.addLink(data.parent.username, node);
        });

        visualizer.on('add:node', function(data) {
            Store.addNode(data);
        });

        visualizer.on('add:link', function(data) {
            Store.addLink(data);
        });

        var startBuild = function(username) {
            var graph = Store.getGroup(username);

            if(graph) {
                visualizer.addGraph(graph);
            } else {
                crawler.start('http://habrahabr.ru/users/' + username + '/');
            }
        };

        ControlElements.startButton.on('click', function() {
            visualizer.reset();
            crawler.requestDelay = 0;
            Control.clearStates();

            var qty = ControlElements.qtyInput.val();

            for (var i = 0; i < qty; i++) {
                startBuild(userList[i]);
            }
        });

        Store.onBuildDone = Control.completeBuild;
        ControlElements.resetButton.on('click', $.proxy(visualizer.reset, visualizer));
        ControlElements.clearStorageButton.on('click', $.proxy(Store.clear, Store));
    };

    return {
        start: start
    };
});
