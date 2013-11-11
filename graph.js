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
            distance: 200,
            charge: -100
        };

        var graph = this;

        this.options = $.extend(defaults, options);

        var $window = $(window),
            w = $window.width(),
            h = $window.height();

        this.svg = d3.select(canvas).append('svg');

        // https://github.com/mbostock/d3/wiki/Force-Layout#wiki-nodes
        this.nodes = [];
        // https://github.com/mbostock/d3/wiki/Force-Layout#wiki-links
        this.links = [];

        // svg items
        this.link = null;
        this.node = null;

        // https://github.com/mbostock/d3/wiki/Force-Layout
        this.force = d3.layout.force()
            .nodes(this.nodes)
            .links(this.links)
            .distance(this.options.distance)
            .linkDistance(calculateLinkLenght)
            .charge(this.options.charge)
            .size([w, h]);

        this.force.on('tick', function() {
            graph.link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            graph.node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        });

        $window.on('resize', function() {
            var w = $window.width(),
                h = $window.height();
            graph.svg
                .attr('width', w - 20)
                .attr('height', h - 20);
            graph.force.size([w - 20, h - 20]);
        });
    };

    /**
     * @param {string} name
     * @param {string} image
     * @param {int} [size=0]
     * @param {Object} [options={}]
     */
    Graph.prototype.add = function(name, image, size, options) {
        size = size || 0;
        options = $.extend({}, options);
        var node = {name: name, image: image, size: size, o: options, __forceSize: size > 0};
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

        if(this.isLinkExists(source, target)) {
            return this;
        }

        this.links.push({
            source: source,
            target: target
        });

        [source, target].forEach(function(node) {
            if(!node.__forceSize) {
                node.size++;
            }
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
     * @param {Object} source
     * @param {Object} target
     */
    Graph.prototype.isLinkExists = function (source, target) {
        for(var i = 0, l = this.links.length; i < l; i++) {
            if (this.links[i].source === source && this.links[i].target === target) {
                return true;
            }
        }

        return false;
    };

    /**
     */
    Graph.prototype.update = function() {
        var graph = this;

        graph.link = this.svg.selectAll('.link')
           .data(graph.links, function(d) { return d.source.name + '-' + d.target.name; });

        // Enter any new links.
        graph.link.enter().insert("svg:line", ".node")
            .attr("class", "link")
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        // Exit any old links.
        graph.link.exit().remove();

        // select all existed nodes
        graph.node = graph.svg.selectAll(".node")
            .data(graph.nodes, function(d) { return d.name; });

        // Update the images…
        graph.node.selectAll("image")
            .transition()
            .attr("x", function(d) { return -calculateNodeSize(d) / 2 })
            .attr("y", function(d) { return -calculateNodeSize(d) / 2 })
            .attr("width", calculateNodeSize)
            .attr("height", calculateNodeSize);

        var elems = graph.node.enter()
            .append("g")
                .attr("class", "node")
                .call(graph.force.drag);

        elems.append("image")
            .attr("xlink:href", function(d) { return d.image })
            .attr("x", function(d) { return -calculateNodeSize(d) / 2 })
            .attr("y", function(d) { return -calculateNodeSize(d) / 2 })
            .attr("width", calculateNodeSize)
            .attr("height", calculateNodeSize);

        elems.append("text")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function(d) { return d.name });

        elems.append('title')
            .text(function(d) { return d.name; });

        graph.node.exit().remove();

        graph.force.start();
    };

    /**
     */
    Graph.prototype.clear = function() {
        this.nodes = [];
        this.links = [];
        this.link = null;
        this.node = null;

        this.force
            .nodes(this.nodes)
            .links(this.links);
    };

    function calculateNodeSize(d) {
        if(d.size > 15) {
            return 32;
        }
        else if(d.size > 10) {
            return 24;
        }
        else if(d.size > 5) {
            return 20;
        }
        else {
            return 16;
        }
    }

    function calculateLinkLenght(d) {
        var size = Math.min(d.source.size, d.target.size);

        if(size > 15) {
            return 220;
        }
        else if(size > 10) {
            return 160;
        }
        else if(size > 5) {
            return 120;
        }
        else {
            return 100;
        }
    }

    return Graph;
});