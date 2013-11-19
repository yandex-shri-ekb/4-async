(function () {
    'use strict';

    var Spinner = require('./spinner'),
        Tree = require('./tree'),
        tree_el = document.querySelector('.tree'),

        Builder = function () {
            if (tree_el) {
                tree_el.style.display = '';
            } else {
                this.initTemplate();
                tree_el = document.querySelector('.tree');
            }

            this.spinner = new Spinner('.spinner');
            this.users = [];
            this.tree = new Tree('.container');
        };

    Builder.prototype.start = function () {
        this.spinner.start();
    };

    Builder.prototype.addUser = function (new_user) {
        new_user.children = [];

        this.users.forEach(function (user) {
            if (!user.children) {
                user.children = [];
            }

            if (user.url === new_user.parent_url && user.children.indexOf(new_user) === -1) {
                user.children.push(new_user);
            }

            if (new_user.children_urls.indexOf(user.url) !== -1 && new_user.children.indexOf(user) === -1) {
                new_user.children.push(user);
            }
        });

        this.users.push(new_user);
        this.tree.update({
            name: '',
            children: this.users.filter(function (user) {
                return !user.parent_url;
            })
        });

        console.log('User parsed', new_user);
    };

    Builder.prototype.stop = function () {
        console.log('Last user sent');
        document.querySelector('.progress').style.display = 'none';
        document.querySelector('.done').style.display = 'inherit';
        this.spinner.stop();
    };

    Builder.prototype.initTemplate = function () {
        var tpl =
            '<section class="tree">' +
            '<style>' +
            '.tree {' +
            'position: absolute;' +
            'top: 0;' +
            'right: 0;' +
            'background: white;' +
            'border: 1px solid #ccc;' +
            'text-align: left;' +
            'padding: 10px 20px 10px 10px;' +
            'min-width; 250px;' +
            '}' +
            '.container {' +
            'margin: 10px 0 0;' +
            'color: #333;' +
            '}' +
            '.close {' +
            'position: absolute;' +
            'right: 10px;' +
            'top: 5px;' +
            'cursor: pointer;' +
            '}' +
            '.done {' +
            'display: none;' +
            '}' +
            '</style>' +
            '<span class="close">×</span>' +
            '<span class="progress">Изучаем генеалогию <span class="spinner"></span></span>' +
            '<span class="done">Вот и всё.</span>' +
            '<div class="container"></div>' +
            '</section>';


        document.body.innerHTML += tpl;

        document.querySelector('.close').addEventListener('click', function () {
            tree_el.parentElement.removeChild(tree_el);
        }, false);
    };

    module.exports = Builder;
}());
