module.exports = function (grunt) {
    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        connect: {
          options: {
            port: 9000,
            hostname: 'localhost',
            livereload: 35729
          },
          dev: {
            options: {
              open: true,
              middleware: function (connect) {
                return [
                  connect().use('/bower_components', connect.static('./bower_components')),
                  connect.static('./dev/public')
                ];
              }
            }
          }
        },
        // replaced by connect task
        express: {
            dev: {
              options: {
                script: 'dev/server.js'
              }
            },
            dist: {
              options: {
                script: 'dev/dist.js',
                node_env: 'production'
              }
            },
            test: {
              options: {
                script: 'path/to/test/server.js'
              }
            }
        },
        sass: {
            dev: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'dev/public/includes/main.css': 'dev/public/includes/main.scss'
                }
            }
        },
        autoprefixer: {
          dev: {
            files: {
              'dev/public/includes/style.css': 'dev/public/includes/main.css'
            }
          }
        },
        watch: {
          livereload: {
            options: {
              livereload: '<%= connect.options.livereload %>'
            },
            files: [
              'dev/public/index.html',
              'dev/public/includes/main.js',
              'dev/public/includes/style.css'
            ]
          },
          jsx: {
            files: ['dev/public/includes/app.js'],
            tasks: ['babel']
          },
          sass: {
              files: ['**/*.scss'],
              tasks: ['sass:dev']
          },
          styles: {
            files: ['dev/public/includes/main.css'],
            tasks: ['autoprefixer']
          }
        },
    });


    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-babel');


    //grunt.registerTask('server', ['express:dev', 'watch']);
    grunt.registerTask('serve', 'Starting Web Server', function () {
      grunt.task.run([
        'connect',
        'watch'
      ]);
    });
    grunt.registerTask('dist', ['express:dist', 'watch']);
};
