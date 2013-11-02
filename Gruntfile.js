module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-bookmarklet-thingy');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-jsbeautifier');

    grunt.initConfig({
        jslint: {
            src: [
                "*.js",
                "chrome_extension/**/*.js",
                "bookmarklet/**/*.js"
            ]
        },
        bookmarklet: {
            generate: {
                body: 'main.js',
                out: 'bookmarklet/bookmarklet.js'
            }
        },
        preprocess: {
            html: {
                src: 'bookmarklet/index.html.tpl',
                dest: 'bookmarklet/index.html'
            }
        },
        "jsbeautifier": {
            files: [
                "*.js",
                "chrome_extension/**/*.js",
                "bookmarklet/**/*.js"
            ],
            options: {
                js: {
                    jslintHappy: true
                }
            }
        }
    });

    grunt.registerTask('default', [
        'jsbeautifier',
        'jslint',
        'bookmarklet',
        'preprocess'
    ]);
};
