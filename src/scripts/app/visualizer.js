define(function(require) {
    'use strict';

    var d3 = require('d3'),
        EventEmitter = require('app/utils/event_emitter'),
        Config = require('app/config/ui_config');

    /**
     * @class
     * @classdesc Класс реализует визуализацию данных.
     */
    var Visualizer = function() {
        EventEmitter.call(this);
        this.width = 900;
        this.height = 700;
        this.nodeCache = {};
        this.createLayout();
    };

    Visualizer.prototype = $.extend({
        /**
         * Метод вставляет в контейнер SVG и инициализирует Force layout.
         * 
         * @return {*}
         */
        createLayout: function() {
            var svg = d3.select('.' + Config.svgContainerClass).append('svg:svg')
                .attr('viewBox', '0 0 ' + this.width + ' ' + this.height)
                .attr('preserveAspectRatio', 'xMinYMin');

            this.force = d3.layout.force()
                .gravity(0.1)
                .distance(100)
                .charge(-100)
                .size([this.width, this.height])
                .on('tick', $.proxy(this.tick, this));

            this.nodes = this.force.nodes();
            this.links = this.force.links();

            this.node = svg.selectAll('g.node');
            this.link = svg.selectAll('line.link');
            this.marker = svg.append('svg:defs').selectAll('marker');
        },

        /**
         * Метод обновляет ссылки и узлы.
         * 
         * @return {*}
         */
        update: function() {
            this.updateLinks();
            this.updateNodes();
            this.force.start();
        },

        /**
         * Метод очищает кэш и удаляет узлы вместе с ссылками.
         * 
         * @return {*}
         */
        reset: function() {
            this.nodeCache = {};
            this.nodes.length = 0;
            this.links.length = 0;
            this.update();
        },

        /**
         * Метод добавляет новый узел.
         * 
         * @fires Visualizer#add:node
         * 
         * @param   {Object} node
         * @return  {*}
         */
        addNode: function(node) {
            /**
             * @event Visualizer#add:node
             * @type {Object}
             */
            this.emit('add:node', node);
            this.nodes.push(node);
            this.update();
        },


        /**
         * Метод добавляет связь между двумя узлами.
         * 
         * @fires Visualizer#add:link
         * 
         * @param   {String} source Идентификатор узла
         * @param   {Object} target Узел
         * @return  {*}
         */
        addLink: function(source, target) {
            var link = {
                source: this.findNode(source),
                target: target
            };
            /**
             * @event Visualizer#add:link
             * @type {Object}
             */
            this.emit('add:link', link);
            this.links.push(link);
            this.update();
        },

        /**
         * Метод добавляет дерево (группу) пользователей.
         * 
         * @param   {Object} graph
         * @return  {*}
         */
        addGraph: function(graph) {
            var self = this;

            Array.prototype.push.apply(this.nodes, graph.nodes);

            var links = graph.links.map(function(link) {
                return {
                    target: self.findNode(link.target),
                    source: self.findNode(link.source)
                };
            });

            Array.prototype.push.apply(this.links, links);
            this.update();
        },

        /**
         * Обработчик события "tick" вызываемого в Force layout.
         * 
         * @return {*}
         */
        tick: function() {
            this.link
                .attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });
            
            this.node.attr('transform', function(d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });
        },

        /**
         * Метод обновляет ссылки текущих узлов.
         * Ссылки визуализируются линиями.
         * 
         * @return {*}
         */
        updateLinks: function() {
            this.link = this.link.data(this.links);

            this.link.enter().insert('line')
                .attr('class', 'link')
                .attr('marker-end', 'url(#end)');

            this.link.exit().remove();

            this.marker = this.marker.data(['end']);

            this.marker.enter().append('svg:marker')
                .attr('id', String)
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 32)
                .attr('markerWidth', 8)
                .attr('markerHeight', 8)
                .attr('orient', 'auto')
                .append('svg:path')
                    .attr('d', 'M0,-5L10,0L0,5');

            this.marker.exit().remove();
        },

        /**
         * Метод обновляет текущие узлы.
         * Узел визуализируется идентификатором и изображением.
         * 
         * @return {*}
         */
        updateNodes: function() {
            this.node = this.node.data(this.nodes);

            var nodeEnter = this.node.enter().append('g')
                .attr('class', 'node')
                .call(this.force.drag);

            nodeEnter.append('text')
                .attr('class', 'node_text')
                .attr('dx', 32)
                .attr('dy', '.35em')
                .text(function(d) {
                    return d.id;
                });

            nodeEnter.append('image')
                .attr('x', '-12px')
                .attr('y', '-12px')
                .attr('width', '24px')
                .attr('height', '24px')
                .attr('xlink:href', function(d) {
                    return d.avatar;
                });

            this.node.exit().remove();
        },


        /**
         * Метод реализует поиск узла по идентификатору.
         * Найденный узел кэшируется.
         * 
         * @param  {String} id Идентификатор узла
         * @return {*}
         */
        findNode: function(id) {
            if(typeof this.nodeCache[id] !== 'undefined') {
                return this.nodeCache[id];
            }

            for(var i = 0, len = this.nodes.length; i < len; i++) {
                if(this.nodes[i].id === id) {
                    this.nodeCache[id] = this.nodes[i];
                    return this.nodes[i];
                }
            }
        }
    }, EventEmitter.prototype);

    return Visualizer;
});
