module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify : {
            main : {
                options : {
                    banner : 'javascript:'
                },
                files : {
                    'build/bookmarklet.min.js' : 'bookmarklet.js'
                }
            }
        },

        requirejs : {
            compile : {
                options : {
                    name : 'main',
                    out : 'build/all.min.js',
                    paths : {
                        'jquery' : 'empty:',
                        'd3' : 'empty:'
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.registerTask('default', ['uglify', 'requirejs']);

};
