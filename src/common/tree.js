(function () {
    'use strict';

    var d3 = require('../../vendor/d3/d3'),

        Tree = function () {
            var m = [20, 120, 20, 120],
                w = 1280 - m[1] - m[3],
                h = 800 - m[0] - m[2];

            this.tree = d3.layout.tree()
                .size([h, w]);

            this.vis = d3.select(".tree").append("svg:svg")
                .attr("width", w + m[1] + m[3])
                .attr("height", h + m[0] + m[2])
                .append("svg:g")
                .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

            this.h = h;
            this.w = w;
        };

    Tree.prototype.update = function (source) {
        var i = 0,
            diagonal = d3.svg.diagonal().projection(function (d) {
                return [d.y, d.x];
            }),
            root = source,
            duration,
            nodes,
            node,
            nodeEnter,
            nodeUpdate,
            nodeExit,
            link;

        root.x0 = this.h / 2;
        root.y0 = 0;

        duration = d3.event && d3.event.altKey ? 5000 : 500;

        // Compute the new tree layout.
        nodes = this.tree.nodes(root).reverse();

        // Normalize for fixed-depth.
        nodes.forEach(function (d) {
            d.y = d.depth * 180;
        });

        // Update the nodes…
        node = this.vis.selectAll("g.node")
            .data(nodes, function (d) {
                if (!d.id) {
                    i += 1;
                    d.id = i;
                }

                return d.id;
            });

        // Enter any new nodes at the parent's previous position.
        nodeEnter = node.enter().append("svg:g")
            .attr("class", "node")
            .attr("transform", function () {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            });

        nodeEnter.append("svg:circle")
            .attr("r", 1e-6)
            .style("fill", function (d) {
                return d.childrenTmp ? "lightsteelblue" : "#fff";
            });

        nodeEnter.append("svg:text")
            .attr("x", function (d) {
                return d.children || d.childrenTmp ? -10 : 10;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", function (d) {
                return d.children || d.childrenTmp ? "end" : "start";
            })
            .text(function (d) {
                return d.name;
            })
            .style("fill-opacity", 1e-6);

        // Transition nodes to their new position.
        nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        nodeUpdate.select("circle")
            .attr("r", 4.5)
            .style("fill", function (d) {
                return d.childrenTmp ? "lightsteelblue" : "#fff";
            });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function () {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // Update the links…
        link = this.vis.selectAll("path.link")
            .data(this.tree.links(nodes), function (d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("svg:path", "g")
            .attr("class", "link")
            .attr("d", function () {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function () {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    };

    module.exports = Tree;
}());
