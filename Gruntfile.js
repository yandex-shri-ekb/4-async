module.exports = function(grunt) {
    grunt.initConfig({
        requirejs: {
            dist: {
                options: {
                    baseUrl: 'src/scripts',
                    mainConfigFile: 'src/scripts/bootstrapper.js',
                    name: 'bootstrapper',
                    out: 'dist/habragraph.build.js',
                    preserveLicenseComments: false,
                    paths: {
                        requireLib: 'vendors/require/require'
                    },
                    include: 'requireLib'
                }
            }
        },

        cssmin: {
            dist: {
                files: {
                    'src/styles/build.css': 'src/styles/css/all.css'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.registerTask('default', ['cssmin', 'requirejs']);
};
