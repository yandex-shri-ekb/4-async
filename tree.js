'use strict';

define([
    'd3'
], function(d3) {

    /**
     * Графическое представление дерева.
     * @constructor
     * @param {Object} config настройки
     */
    var Tree = function(config) {
        config = config || {};
        var w = document.documentElement.clientWidth - 20,
            h = document.documentElement.clientHeight - 20;

        // Продолжительность анимации, мс
        this.duration = config.duration || 100;

        this.svg = d3.select('body').append('svg')
            .style('display', 'block')
            .attr('width', w)
            .attr('height', h)
            .append('g')
            .attr('transform', 'translate(10,10)');

        this.tree = d3.layout.tree()
            .size([w - 40, h - 40]);

        this.root = {};
        this.nodes = this.tree(this.root);

        this.root.parent = this.root;
        this.root.name = 'НЛО';
        this.root.children = [];
        this.root.px = this.root.x;
        this.root.py = this.root.y;
        this.root.avatar = '/favicon.ico';

        var self = this;
        d3.select(window).on('resize', function() {
            var w = document.documentElement.clientWidth - 20;
            var h = document.documentElement.clientHeight - 20;
            d3.select('svg')
                .attr('width', w)
                .attr('height', h);
            self.tree.size([ w - 40, h - 40 ]);
        });
    };

    /**
     * Добавляет узел в дерево.
     * @param {Object} node узел
     * @return {boolean} результат добавления
     */
    Tree.prototype.addNode = function(node) {
        var n = {
            name : node.name,
            avatar : node.avatar
        };

        var parent;
        if (node.parent === null) {
            parent = this.nodes[0];
        } else {
            for (var i = 0, l = this.nodes.length; i < l; i++) {
                if (this.nodes[i].name === node.parent) {
                    parent = this.nodes[i];
                    break;
                }
            }
        }

        if (parent === undefined) {
            console.log('Не могу найти родителя узла ' + node.name);
            return false;
        }

        if (parent.children)
            parent.children.push(n);
        else
            parent.children = [n];
        this.nodes.push(n);

        return true;
    };

    /**
     * Обновляет дерево.
     */
    Tree.prototype.update = function() {
        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.x, d.y]; });

        var node = this.svg.selectAll('.node')
            .data(this.tree.nodes(this.root), function(d) { return d.name; });
        var link = this.svg.selectAll('.link')
            .data(this.tree.links(this.nodes), function(d) { return d.target.name; });

        var nodeEnter = node.enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', function(d) {
                return 'translate(' + d.parent.px + ',' + d.parent.py + ')';
            });

        nodeEnter.append('image')
            .attr('xlink:href', function(d) { return d.avatar; })
            .attr('x', -12)
            .attr('y' -12)
            .attr('opacity', .1)
            .attr('width', 24)
            .attr('height', 24);

        nodeEnter.append('title')
            .text(function(d) { return d.name; });

        link.enter()
            .insert('path', '.node')
            .attr('class', 'link')
            .attr('d', function(d) {
                var o = {x: d.source.px, y: d.source.py};
                return diagonal({ source : o, target : o });
            })
            .attr('fill', 'none')
            .attr('stroke', '#000');

        var t = this.svg.transition()
            .duration(this.duration);

        t.selectAll('.link')
            .attr('d', diagonal);

        t.selectAll('.node')
            .attr('transform', function(d) {
                d.px = d.x;
                d.py = d.y;
                return 'translate(' + d.x + ',' + d.y + ')';
            });

        t.selectAll('image')
            .attr('opacity', 1);
    };

    return Tree;

});
