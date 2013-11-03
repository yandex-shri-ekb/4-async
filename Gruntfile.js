module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-bookmarklet-thingy');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-browserify');

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
        jsbeautifier: {
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
        },
        browserify: {
          dist: {
            files: {
              'chrome_extension/popup.js': ['chrome_extension/popup_main.js'],
              'chrome_extension/contentscript.js': ['chrome_extension/contentscript_main.js']
            }
          }
        }
    });

    grunt.registerTask('default', [
        // 'jsbeautifier',
        // 'jslint',
        'browserify',
        'bookmarklet',
        'preprocess'
    ]);
};
