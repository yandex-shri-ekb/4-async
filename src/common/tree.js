(function () {
    'use strict';

    var d3 = require('../../vendor/d3/d3'),
        $ = require('../../vendor/jquery/jquery'),

        Tree = function (container, provider) {
            this.provider = new AsciiTreeProvider(container);
        },

        AsciiTreeProvider = function (container) {
            var $container = $(container),
                objLength,
                drawLeaf,
                drawTree;

            objLength = function (obj) {
                var length = 0,
                    i;

                for (i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        length += 1;
                    }
                }

                return length;
            }
            
            drawLeaf = function (level, value, isLastChild) {
                var prefix = level === 0 ? '' : (isLastChild ? '┗ ' : '┝ ');

                while (level > 1) {
                    prefix = '┃ ' + prefix;
                    level -= 1;
                }

                $container.append('<div>' + prefix + value + '</div>');
            };

            drawTree = function (level, tree) {
                var length = objLength(tree.children),
                    i;

                for (i in tree.children) {
                    if (tree.children.hasOwnProperty(i)) {
                        length -= 1;

                        drawLeaf(level, tree.children[i].name, length === 0);
                        drawTree(level + 1, tree.children[i]);
                    }
                }
            };

            return {
                update: function (source) {
                    $container.empty();
                    drawTree(0, source);
                }
            }
        };

    Tree.prototype.update = function(source) {
        this.provider.update(source);
    };

    module.exports = Tree;
}());
