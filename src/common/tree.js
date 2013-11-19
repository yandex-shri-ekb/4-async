(function () {
    'use strict';

    var AsciiTreeProvider = function (container) {
        var container_el = document.querySelector(container),
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
        };

        drawLeaf = function (level, value, isLastChild) {
            var prefix = level === 0 ? '' : (isLastChild ? '┗ ' : '┝ '),
                leaf_el = document.createElement('div');

            while (level > 1) {
                prefix = '┃ ' + prefix;
                level -= 1;
            }

            leaf_el.textContent = prefix + value;
            container_el.appendChild(leaf_el);
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
                container_el.textContent = '';
                drawTree(0, source);
            }
        };
    },

        Tree = function (container) {
            this.provider = new AsciiTreeProvider(container);
        };

    Tree.prototype.update = function (source) {
        this.provider.update(source);
    };

    module.exports = Tree;
}());
