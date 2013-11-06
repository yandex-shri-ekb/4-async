module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        bower: {
            install: {
                options: {
                    targetDir: './vendor',
                    cleanup: true
                }
            }
        },
        jslint: {
            dist: {
                src: [
                    "src/**/*.js",
                    "Gruntfile.js"
                ],
                directives: {
                    browser: true,
                    node: true,
                    undef: true,
                    predef: ["chrome"]
                }
            }
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
                "src/**/*.js",
                "Gruntfile.js"
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
                    'chrome_extension/popup.js': 'src/chrome_extension/popup.js',
                    'chrome_extension/contentscript.js': 'src/chrome_extension/contentscript.js'
                },
                options: {
                    shim: {
                        d3: {
                            path: 'vendor/d3/d3.js',
                            exports: 'd3'
                        }
                    }
                }
            }
        }
    });

    grunt.registerTask('default', [
        'bower',
        'jsbeautifier',
        'jslint',
        'browserify',
        'bookmarklet',
        'preprocess'
    ]);
};
