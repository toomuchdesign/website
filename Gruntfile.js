module.exports = function(grunt) {

    // configure the tasks
    grunt.initConfig({

        //Import settings
        settings: {
            source: 'source',
            build: 'build',
            static_files_pattern: ['img/**', 'fonts/**', 'files/**' ],
        },

        clean: {
            //Delete everything except for build css and js folder
            static_files: {
                expand: true,                                // Enable dynamic expansion.
                cwd: '<%= settings.build %>',                // Src matches are relative to this path.
                src: '<%= settings.static_files_pattern %>', // Actual pattern(s) to match.
            },

            markup_files: {
                src: [ '<%= settings.build %>/*.html' ],
            },

            stylesheets: {
                src: [ '<%= settings.build %>/css/*.css' ]
            },

            javascript_vendor: {
                src: [ '<%= settings.build %>/js/vendor/**' ]
            },
            
        }, //end Clean

        copy: {
            static_files: {
                files: [{
                        // Move static into build folder
                        expand: true,                                // Enable dynamic expansion.
                        cwd: '<%= settings.source %>',               // Src matches are relative to this path.
                        src: '<%= settings.static_files_pattern %>', // Actual pattern(s) to match.
                        dest: '<%= settings.build %>',               // Destination path prefix.
                        filter: 'isFile',
                }],
            },

            markup_files: {
                files: [{
                        // Move static into build folder
                        expand: true,
                        cwd: '<%= settings.source %>', 
                        src: [ '*.html' ],
                        dest: '<%= settings.build %>',
                        filter: 'isFile',
                }],
            },

            javascript_vendor: {
                files: [{
                        // Move vendor files which need to be served separately
                        expand: true,                              // Enable dynamic expansion.
                        cwd: '<%= settings.source %>/js/vendor/',  // Src matches are relative to this path.
                        src: [ '**' ],                             // Actual pattern(s) to match.
                        dest: '<%= settings.build %>/js/vendor/',  // Destination path prefix.
                        filter: 'isFile',
                }],
            },
        }, //end Copy

        less: {
            options: {
                cleancss: false,
                compress: false,
            },

            stylesheets: {
                options: {
                    //modifyVars : {'varName': 'varValue'},
                    sourceMap: true,
                    sourceMapFilename: '<%= settings.build %>/css/style.css.map',
                    sourceMapURL: 'style.css.map',
                },
                files: {
                    '<%= settings.build %>/css/style.css': '<%= settings.source %>/less/style.less',
                },
            },
        }, //end Less

        autoprefixer: {

            options: {
                //https://github.com/postcss/autoprefixer#browsers
                browsers: [ 'last 10 versions', 'ie 8', 'ie 9' ],
            },

            stylesheets: {
                options: {
                    map: true
                },
                src: '<%= settings.build %>/css/style.css',
            },
        }, //end Autoprefixer

        //Expose media queries style for old ie
        match_media: {

            old_ie: {
                options: {
                    width: '960px',
                },
                files: {
                    '<%= settings.build %>/css/ie.css': ['<%= settings.build %>/css/style.css']
                }
            }
        }, //end Match media

        uglify: {

            //Uglify all .js files in js folder except for files beginning with '_' 
            javascript_files: {
                files: [{
                    expand: true,
                    cwd: '<%= settings.source %>/js',
                    src: [ '*.js', '!_*' ],
                    dest: '<%= settings.build %>/js'
                }],
            },

            //Join all file lying in source/js/_plugins folder into plugins.js
            javascript_plugins: {
                files: {
                    '<%= settings.build %>/js/plugins.js': [ '<%= settings.source %>/js/_plugins/*.js' ],
                }
            }
        }, //end Uglify

        watch: {

            options: {
                cwd: {
                    files: '<%= settings.source %>'
                }
            },

            static_files: {
                //Listen for changed static files
                files: [ '<%= settings.static_files_pattern %>' ],
                tasks: [ 'build_static_files' ],
            },

            markup_files: {
                //Listen for changed markup files
                files: [ '*.html' ],
                tasks: [ 'build_markup_files' ],
            },

            stylesheets: {
                //Listen for changed .less files
                files: [ 'less/**' ],
                tasks: [ 'build_stylesheets' ],
            },

            javascript_files: {
                //Listen for changed .js files in /js folder
                files: [ 'js/*.js' ],
                tasks: [ 'uglify:javascript_files' ],
            },

            javascript_plugins: {
                //Listen for changed .js plugins files in /_plugins folder
                files: [ 'js/_plugins/*' ],
                tasks: [ 'uglify:javascript_plugins' ],
            },

            javascript_vendor: {
                //Listen for changed .js vendors files in /vendor folder
                files: [ 'js/vendor/*' ],
                tasks: [ 'clean:javascript_vendor', 'copy:javascript_vendor' ],
            },
        }, //end Watch

    });

    // load the tasks
    grunt.loadNpmTasks('grunt-notify');

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-newer');
    
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-match-media');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask (
        'build', 
        'Build the whole project.',
        [ 'build_static_files',
          'build_markup_files',
          'build_stylesheets',
          'match_media:old_ie',
          'build_javascript',
           ]
    );

    grunt.registerTask (
        'build_static_files', 
        'Build static files.', 
        [ 'newer:clean:static_files',
          'newer:copy:static_files',
           ]
    );

    grunt.registerTask (
        'build_markup_files', 
        'Build HTML files.', 
        [ 'clean:markup_files',
          'copy:markup_files',
           ]
    );

    grunt.registerTask (
        'build_stylesheets', 
        'Build Stylesheets.', 
        [ 'clean:stylesheets',
          'less:stylesheets',
          'autoprefixer:stylesheets',
           ]
    );

    grunt.registerTask (
        'build_javascript', 
        'Build Javascript.', 
        [ 'uglify:javascript_files',      // Uglify Project-related JS files and move them into build folder
          'uglify:javascript_plugins',    // Uglify JS 3rd-party plugins and move them into build folder
          'clean:javascript_vendor',      // Clean build JS Vendor folder
          'copy:javascript_vendor',       // Copy files into build JS Vendor folder
           ]
    );

    grunt.registerTask(
        'default', 
        'Watches the project for changes, automatically and exports static files.', 
        [ 'watch' ]
    );
}