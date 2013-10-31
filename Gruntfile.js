module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-bookmarklet-thingy');
  grunt.loadNpmTasks('grunt-preprocess');

  grunt.initConfig({
    jslint: {
      client: {
        src: [
          'main.js'
        ]
      }
    },
    bookmarklet: {
      generate: {
        body: 'main.js',
        out: 'bookmarklet.js'
      }
    },
    preprocess : {
      html : {
        src : 'index.html.tpl',
        dest : 'index.html'
      },
    }
  });

  grunt.registerTask('default', ['jslint', 'bookmarklet', 'preprocess']);
};