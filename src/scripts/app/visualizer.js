define(function(require) {
    'use strict';

    var d3 = require('d3'),
        EventTarget = require('./event_target');

    var Visualizer = function() {
        EventTarget.call(this);
        this.width = 900;
        this.height = 700;
        this.nodeCache = {};
        this.createLayout();
    };

    Visualizer.prototype = $.extend(EventTarget.prototype, {
        createLayout: function() {
            var svg = d3.select('.layout_container-svg').append('svg:svg')
                .attr('viewBox', '0 0 ' + this.width + ' ' + this.height)
                .attr('preserveAspectRatio', 'xMinYMin');

            this.force = d3.layout.force()
                .gravity(0.05)
                .distance(100)
                .charge(-100)
                .size([this.width, this.height])
                .on('tick', $.proxy(this.tick, this));

            this.nodes = this.force.nodes();
            this.links = this.force.links();

            this.node = svg.selectAll('g.node');
            this.link = svg.selectAll('line.link');
        },

        update: function() {
            this.updateLinks();
            this.updateNodes();
            this.force.start();
        },

        reset: function() {
            this.nodeCache = {};
            while(this.nodes.pop()) {}
            while(this.links.pop()) {}
            this.update();
        },

        addNode: function(node) {
            this.trigger('add:node', node);
            this.nodes.push(node);
            this.update();
        },

        addLink: function(source, target) {
            var link = {
                source: this.findNode(source),
                target: target
            };
            this.trigger('add:link', link);
            this.links.push(link);
            this.update();
        },

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

        updateLinks: function() {
            this.link = this.link.data(this.links);

            this.link.enter().insert('line')
                .attr('class', 'link');

            this.link.exit().remove();
        },

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
                .attr('x', '-16px')
                .attr('y', '-16px')
                .attr('width', '32px')
                .attr('height', '32px')
                .attr('xlink:href', function(d) {
                    return d.avatar;
                });

            this.node.exit().remove();
        },

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
    });

    return Visualizer;
});
