'use strict';

define('graph', ['d3', 'jquery'], function(d3, $) {
    /** @class Graph */

    /**
     * @constructor
     * @param {Object} canvas
     * @param {Object} options
     */
    var Graph = function(canvas, options) {
        var defaults = {
            distance: 100,
            linkDistance: 100,
            charge: -100,
            w: 800,
            h: 600
        };

        var graph = this;

        this.options = $.extend(defaults, options);

        this.svg = d3.select(canvas)
            .append('svg')
            .style('display', 'block')
            .attr('width', '100%')
            .attr('height', '100%');

        //root.x = this.options.w / 2;
        //root.y = this.options.h / 2;

        // https://github.com/mbostock/d3/wiki/Force-Layout#wiki-nodes
        this.nodes = [];
        // https://github.com/mbostock/d3/wiki/Force-Layout#wiki-links
        this.links = [];

        this.link = null;
        this.node = null;

        // https://github.com/mbostock/d3/wiki/Force-Layout
        this.force = d3.layout.force()
            .nodes(this.nodes)
            .links(this.links)
            .distance(this.options.distance)
            .linkDistance(this.options.linkDistance)
            .charge(this.options.charge)
            .size([this.options.w, this.options.h])
            .start();

        this.force.on('tick', function() {
            graph.link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            graph.node
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        })
    };

    /**
     * @param {string} name
     * @param {?int} size
     * @param {?Object} options
     */
    Graph.prototype.add = function(name, size, options) {
        size = size || 0;
        options = $.extend({fill: '#222'}, options);
        var node = {name: name, size:size, o: options};
        this.nodes.push(node);

        return node;
    };

    /**
     * @param {Object} source
     * @param {Object} target
     */
    Graph.prototype.linkNodes = function (source, target) {
        if(!source || !target) {
            throw new Error('Cannot link empty nodes');
        }

        this.links.push({
            source: source,
            target: target
        });

        return this;
    };

    /**
     * @param {string} name
     * @returns {Object|null}
     */
    Graph.prototype.find = function(name) {
        for(var i = 0, l = this.nodes.length; i < l; i++) {
            if (this.nodes[i].name === name) {
                return this.nodes[i];
            }
        }

        return null;
    };

    /**
     */
    Graph.prototype.update = function() {
        var graph = this;

        graph.force
            .nodes(graph.nodes)
            .links(graph.links)
            .start();

        graph.link = this.svg.selectAll('.link')
           .data(this.force.links(), function(d) { return d.source.name + '-' + d.target.name });

        // Enter any new links.
        graph.link.enter().insert("svg:line", ".node")
            .attr("class", "link")
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        // Exit any old links.
        graph.link.exit().remove();

        // Update the nodes…
        graph.node = this.svg.selectAll("circle.node")
            .data(graph.nodes, function(d) { return d.name; })
            .style("fill", function(d) { return d.o.fill; });

        graph.node.transition()
            .attr("r", function(d) { return 5 + Math.floor(d.size * 2 / 5) / 2 });

        // Enter any new nodes.
        graph.node.enter().append("svg:circle")
            .attr("class", "node")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", function(d) { return 5 + Math.floor(d.size * 2 / 5) / 2 })
            .style("fill", function(d) { return d.o.fill; })
            .call(graph.force.drag)
            .append('title').text(function(d) { return d.name; });
        graph.node.exit().remove();
    };

    return Graph;

});