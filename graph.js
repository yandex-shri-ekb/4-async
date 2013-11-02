'use strict';

define([
    'd3'
], function(d3) {

    /**
     * Отвечает за визуализацию дерева.
     *
     * @constructor
     * @param {Object} config настройки
     */
    var Graph = function(config) {
        config = config || {};
        config.width = document.documentElement.clientWidth;
        config.height = document.documentElement.clientHeight;

        this.svg = d3.select('body').append('svg')
            .attr('width', '100%')
            .attr('height', '100%');

        // Список пользователей
        this.nodes = [
            { name : 'НЛО', x : config.width / 2, y : config.height / 2, avatar : '/favicon.ico', fixed : true }
        ];

        // Связи (кто кого пригласил)
        this.links = [];

        this.force = d3.layout.force()
            .nodes(this.nodes)
            .links(this.links)
            .distance(100)
            .linkDistance(100)
            .charge(-100)
            .size([config.width, config.height])
            .start();

        var self = this;
        d3.select(window).on('resize', function() {
            self.force.size([document.documentElement.clientWidth, document.documentElement.clientHeight]);
        });
    };

    /**
     * Добавляет узел и обновляет холст.
     *
     * @param {Object} node объект пользователя
     */
    Graph.prototype.addNode = function(node) {
        this.nodes.push({
            name   : node.name,
            avatar : node.avatar
        });
    };

    /**
     * Добавляет связь и обновляет холст.
     *
     * @param {string} source имя пригласившего пользователя
     * @param {string} target имя приглашённого пользователя
     */
    Graph.prototype.addLink = function (source, target) {
        source = this.findNode(source);
        target = this.findNode(target);

        if (source && target) {
            this.links.push({
                source : source,
                target : target
            });
        }
    };

    /**
     * Ищет в списке узлов и по возможности возвращает пользователя с запрашиваемым именем.
     *
     * @param {string} name имя пользователя
     * @returns {(Object|boolean)} объект пользователя или false
     */
    Graph.prototype.findNode = function(name) {
        for (var i in this.nodes) {
            if (this.nodes[i]['name'] === name)
                return this.nodes[i];
        }
        return false;
    };

    /**
     * Обновляет холст.
     */
    Graph.prototype.update = function() {
        // Связи
        var link = this.svg.selectAll('.link')
            .data(this.force.links(), function(d) { return d.source.name + '-' + d.target.name });

        link.enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke', '#666');
        link.exit().remove();

        // Узлы
        var node = this.svg.selectAll('.node')
            .data(this.force.nodes(), function(d) { return d.name });
        var nodeEnter = node.enter()
            .append('g')
            .attr('class', 'node')
            .call(this.force.drag);
        /*
        nodeEnter.append('circle')
            .attr('r', 12)
            .attr('fill', 'white')
            .attr('stroke', 'black');
        */
        nodeEnter.append('title')
            .text(function(d) {
                return d.name;
            });
        nodeEnter.append('image')
            .attr('xlink:href', function(d) {
                return d.avatar;
            })
            .attr('x', -12)
            .attr('y', -12)
            .attr('width', 24)
            .attr('height', 24);
        /*
        nodeEnter.append('text')
            .attr('dx', 16)
            .attr('dy', 4)
            .text(function(d) {
                return d.name;
            });
        */
        node.exit().remove();

        this.force.on('tick', function() {
            link.attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });
            node.attr('transform', function(d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });
        })
            .nodes(this.nodes)
            .links(this.links)
            .start();
    };

    return Graph;

});
