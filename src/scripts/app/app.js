define(function(require) {
    'use strict';

    var $ = require('jquery'),
        Control = require('app/ui/control'),
        Crawler = require('app/crawler'),
        Store = require('app/store/store'),
        Visualizer = require('app/visualizer');

    /**
     * Функция инициализирующая основную логику приложения.
     * 
     * @param  {Array} userList Топ-100 пользователей
     * @return {*}
     */
    var start = function(userList) {
        var ControlElements = Control.cacheElements(),
            visualizer = new Visualizer(),
            crawler = new Crawler();

        /**
         * Обработка события вызванного успешным получением данных о корне группы.
         *
         * @param  {Object} data Инфомация о корне (пользователе)
         */
        crawler.on('get:root', function(data) {
            var node = data.user.pure(data.group);
            visualizer.addNode(node);
            Control.startBuild(data.group);
        });

        /**
         * Обработка события вызванного успешным получением данных пользователей.
         * 
         * @param  {Object} data Инфомация о узле (пользователе)
         */
        crawler.on('get:node', function(data) {
            var node = data.user.pure(data.group);
            visualizer.addNode(node);
            visualizer.addLink(data.parent.username, node);
        });

        /**
         * Обработка события вызванного визуализацией узла.
         * 
         * @param  {Object} data Узел
         */
        visualizer.on('add:node', function(data) {
            Store.addNode(data);
        });

        /**
         * Обработка события вызванного визуализацией ссылки.
         * 
         * @param  {Object} data Ссылка
         */
        visualizer.on('add:link', function(data) {
            Store.addLink(data);
        });

        /**
         * Функция инициализирует визуализицию группы пользователей.
         * 
         * @param  {String} username
         * @return {*}
         */
        var startBuild = function(username) {
            var graph = Store.getGroup(username);

            /**
             * Если пользователь принадлежит к какой-либо группе в хранилище, она визуализируется.
             * Иначе запускается процесс построения группы.
             */
            if(graph) {
                visualizer.addGraph(graph);
            } else {
                crawler.start(username);
            }
        };

        var generalReset = function() {
            visualizer.reset();
            crawler.stop();
            Control.clearStates();
            Store.clear();
        };

        /** Обработка событий UI */
        
        ControlElements.resetButton.on('click', generalReset);

        ControlElements.clearStorageButton.on('click', function() {
            generalReset();
            Store.reset();
        });

        ControlElements.startButton.on('click', function() {
            generalReset();
            var qty = ControlElements.qtyInput.val();
            for (var i = 0; i < qty; i++) {
                startBuild(userList[i]);
            }
        });

        Store.onBuildDone = Control.completeBuild;
    };

    return {
        start: start
    };
});
