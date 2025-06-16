module.exports = function (grunt) {
    const config = require('./.screeps.json');

    grunt.initConfig({
        clean: ['dist'],

        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.js', '**/*.json'],
                    dest: 'dist',
                    flatten: true
                }]
            }
        },

        watch: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['upload'],
                options: {
                    spawn: false
                }
            }
        },

        screeps: {
            options: config,
            dist: {
                src: ['dist/*.js']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-screeps');

    grunt.registerTask('build', ['clean', 'copy']);
    grunt.registerTask('upload', ['build', 'screeps']);
    grunt.registerTask('default', ['upload']);
};
