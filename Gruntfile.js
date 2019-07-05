module.exports = function(grunt) {
  'use strict';

  // configure the tasks
  grunt.initConfig({
    //Import settings
    settings: {
      source: 'source',
      build: 'build',
      static_files_pattern: [
        'cv/**',
        'img/**',
        '!img/works',
        'fonts/**',
        'files/**',
        'scripts/**',
        'favicon.ico',
        'apple-touch-icon.png',
      ],
      thumbnails: ['img/works/'],
      node_modules: 'node_modules',
    },

    clean: {
      //Delete everything except for build css and js folder
      static_files: {
        expand: true, // Enable dynamic expansion.
        cwd: '<%= settings.build %>', // Src matches are relative to this path.
        src: '<%= settings.static_files_pattern %>', // Actual pattern(s) to match.
      },

      thumbnails: {
        src: ['<%= settings.build %>/<%= settings.thumbnails %>/*.jpg'],
      },

      markup_files: {
        src: ['<%= settings.build %>/*.html'],
      },

      stylesheets: {
        src: ['<%= settings.build %>/css/*.css'],
      },

      javascript: {
        src: ['<%= settings.build %>/js/**'],
        filter: 'isFile',
      },

      javascript_vendor: {
        src: ['<%= settings.build %>/js/vendor/**'],
      },
    }, //end clean

    copy: {
      static_files: {
        files: [
          {
            // Move static into build folder
            expand: true, // Enable dynamic expansion.
            cwd: '<%= settings.source %>', // Src matches are relative to this path.
            src: '<%= settings.static_files_pattern %>', // Actual pattern(s) to match.
            dest: '<%= settings.build %>', // Destination path prefix.
            filter: 'isFile',
          },
        ],
      },

      thumbnails: {
        files: [
          {
            // Move thumbnails into build folder
            expand: true,
            cwd: '<%= settings.source %>',
            src: ['<%= settings.thumbnails %>/*.jpg'],
            dest: '<%= settings.build %>',
          },
        ],
      },

      markup_files: {
        files: [
          {
            // Move static into build folder
            expand: true,
            cwd: '<%= settings.source %>',
            src: ['*.html'],
            dest: '<%= settings.build %>',
            filter: 'isFile',
          },
        ],
      },

      javascript_vendor: {
        files: [
          {
            // Move vendor files which need to be served separately
            expand: true, // Enable dynamic expansion.
            cwd: '<%= settings.source %>/js/vendor/', // Src matches are relative to this path.
            src: ['**'], // Actual pattern(s) to match.
            dest: '<%= settings.build %>/js/vendor/', // Destination path prefix.
            filter: 'isFile',
          },
        ],
      },
    }, //end copy

    responsive_images: {
      //See: https://github.com/andismith/grunt-responsive-images
      //See: http://imagemagick.org
      options: {
        quality: 85,
        engine: 'im',
      },
      small: {
        options: {
          sizes: [{name: 's', width: 79}],
        },
        files: [
          {
            expand: true,
            cwd: '<%= settings.build %>',
            src: ['<%= settings.thumbnails %>/*_small.jpg'],
            dest: '<%= settings.build %>',
          },
        ],
      },
      large: {
        options: {
          sizes: [{name: 's', width: 201}],
        },
        files: [
          {
            expand: true,
            cwd: '<%= settings.build %>',
            src: ['<%= settings.thumbnails %>/*_large.jpg'],
            dest: '<%= settings.build %>',
          },
        ],
      },
      full: {
        options: {
          sizes: [{name: 's', width: 290}],
        },
        files: [
          {
            expand: true,
            cwd: '<%= settings.build %>',
            src: ['<%= settings.thumbnails %>/*_full.jpg'],
            dest: '<%= settings.build %>',
          },
        ],
      },
    }, // end responsive_images

    responsive_images_extender: {
      target: {
        options: {
          srcset: [{suffix: '-s', value: '320w'}],
          sizes: [
            {
              selector: '.lazyload',
              sizeList: [
                {
                  cond: 'min-width: 770px',
                  size: '65vw',
                },
                {
                  cond: 'default',
                  size: '100vw',
                },
              ],
            },
          ],
        },
        files: {
          '<%= settings.build %>/index.html':
            '<%= settings.build %>/index.html',
        },
      },
    }, // end responsive_images_extender

    less: {
      options: {
        cleancss: true,
        compress: true,
      },

      stylesheets: {
        options: {
          sourceMap: true,
          sourceMapFilename: '<%= settings.build %>/css/style.css.map',
          sourceMapURL: 'style.css.map',
        },
        files: {
          '<%= settings.build %>/css/style.css':
            '<%= settings.source %>/less/style.less',
        },
      },
    }, //end less

    autoprefixer: {
      options: {
        //https://github.com/postcss/autoprefixer#browsers
        browsers: ['last 10 versions', 'ie 8', 'ie 9'],
      },

      stylesheets: {
        options: {
          map: true,
        },
        src: '<%= settings.build %>/css/style.css',
      },
    }, //end autoprefixer

    uglify: {
      options: {
        sourceMap: true,
      },

      //Uglify all .js files in js folder except for files beginning with '_'
      javascript_files: {
        files: [
          {
            expand: true,
            cwd: '<%= settings.source %>/js',
            src: ['*.js', '!_*'],
            dest: '<%= settings.build %>/js',
          },
        ],
      },

      //Join all client dependencies
      client_components: {
        files: {
          '<%= settings.build %>/js/plugins.js': [
            '<%= settings.node_modules %>/domready/ready.js',
            '<%= settings.node_modules %>/lazysizes/lazysizes.js',
            '<%= settings.node_modules %>/lazysizes/plugins/respimg/ls.respimg.js',
            '<%= settings.node_modules %>/smooth-scroll/dist/smooth-scroll.js',
          ],
        },
      },
    }, //end uglify

    concat: {
      javascript_files: {
        options: {
          sourceMap: true,
        },
        files: {
          '<%= settings.build %>/js/global.js': [
            '<%= settings.build %>/js/plugins.js',
            '<%= settings.build %>/js/main.js',
          ],
        },
      },
    }, //end concat

    watch: {
      options: {
        cwd: {
          files: '<%= settings.source %>',
        },
      },

      static_files: {
        //Listen for changed static files
        files: ['<%= settings.static_files_pattern %>'],
        tasks: ['build_static_files'],
      },

      markup_files: {
        //Listen for changed markup files
        files: ['*.html'],
        tasks: ['build_markup_files'],
      },

      stylesheets: {
        //Listen for changed .less files
        files: ['less/**'],
        tasks: ['build_stylesheets'],
      },

      javascript_files: {
        //Listen for changed .js files in /js folder
        files: ['js/*.js'],
        tasks: ['build_javascript'],
      },

      javascript_vendor: {
        //Listen for changed .js vendors files in /vendor folder
        files: ['js/vendor/*'],
        tasks: ['clean:javascript_vendor', 'copy:javascript_vendor'],
      },
    }, //end watch

    browserSync: {
      bsFiles: {
        src: [
          './<%= settings.build %>/css/*.css',
          './<%= settings.build %>/js/*.js',
          './<%= settings.build %>/*.html',
        ],
      },
      options: {
        watchTask: true,
        server: './<%= settings.build %>',
      },
    }, //end browserSync
  });

  // load the tasks
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('build', 'Build the whole project.', [
    'build_static_files',
    'build_markup_files',
    'build_thumbnails',
    'build_stylesheets',
    'build_javascript',
  ]);

  grunt.registerTask('build_static_files', 'Build static files.', [
    'newer:clean:static_files',
    'newer:copy:static_files',
  ]);

  grunt.registerTask('build_thumbnails', '', [
    'clean:thumbnails',
    'copy:thumbnails',
    'responsive_images',
  ]);

  grunt.registerTask('build_markup_files', 'Build HTML files.', [
    'clean:markup_files',
    'copy:markup_files',
    //'responsive_images_extender',
  ]);

  grunt.registerTask('build_stylesheets', 'Build Stylesheets.', [
    'clean:stylesheets',
    'less:stylesheets',
    'autoprefixer:stylesheets',
  ]);

  grunt.registerTask('build_javascript', 'Build Javascript.', [
    'clean:javascript', // Clean build JS files
    'uglify:javascript_files', // Uglify Project-related JS files and move them into build folder
    'uglify:client_components', // Uglify JS 3rd-party plugins and move them into build folder
    'concat:javascript_files', // Join JS files in a single file
    'clean:javascript_vendor', // Clean build JS Vendor folder
    'copy:javascript_vendor', // Copy files into build JS Vendor folder
  ]);

  grunt.registerTask(
    'sync',
    'The same of default task with addition of browserSync aid.',
    ['build', 'browserSync', 'watch']
  );

  grunt.registerTask(
    'default',
    'Watches the project for changes, automatically and exports static files.',
    ['watch']
  );
};
