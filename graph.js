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

        var $window = $(window),
            $body = $(document.body),
            w = $window.width(),
            h = $window.height();

        this.svg = d3.select(canvas).append('svg');

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
            .size([w, h])
            .start();

        this.force.on('tick', function() {
            graph.link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            /*graph.node
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });*/

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
     * @param {?int} size
     * @param {?Object} options
     */
    Graph.prototype.add = function(name, image, size, options) {
        size = size || 0;
        options = $.extend({}, options);
        var node = {name: name, image: image, size: size, o: options};
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

        graph.force.start();

        graph.link = this.svg.selectAll('.link')
           .data(graph.links);

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
        graph.node = graph.svg.selectAll(".node").data(graph.nodes);

        var elems = graph.node.enter()
            .append("g")
                .attr("class", "node")
                .call(graph.force.drag);

        /*elems.append("image")
            .attr("xlink:href", function(d) { return d.image })
            .attr("x", -8)
            .attr("y", -8)
            .attr("width", 16)
            .attr("height", 16);*/

        elems.append("image")
            .attr("xlink:href", function(d) { return d.image })
            .attr("x", function(d) { return -calculateSize(d.size) / 2 })
            .attr("y", function(d) { return -calculateSize(d.size) / 2 })
            .attr("width", function(d) { return calculateSize(d.size) })
            .attr("height", function(d) { return calculateSize(d.size) });

        elems.append("text")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function(d) { return d.name });

        elems.append('title')
            .text(function(d) { return d.name; });

        /*graph.node.append("text")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function(d) { return d.name });*/
        /*graph.node = graph.svg.selectAll("circle.node")
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
            .append('title').text(function(d) { return d.name; });*/
        graph.node.exit().remove();
    };

    function calculateSize(size) {
        if(size > 15) {
            return 32;
        }
        else if(size > 10) {
            return 24;
        }
        else if(size > 5) {
            return 20;
        }
        else {
            return 16;
        }
    }

    return Graph;
});