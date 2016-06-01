var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var del = require('del');
 

gulp.task('clean', function(){
    return del(['./dist/index.html', './dist/scripts/*', './dist/css/*']);
});

gulp.task('templates', ['clean'], function(){
  gulp.src('source/templates/*.hbs')
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'RadioWars.templates',
      noRedeclare: true, // Avoid duplicate declarations 
    }))
    .pipe(concat('hbsTemplates.js'))
    .pipe(gulp.dest('dist/js/'));
});


gulp.task('moveHTML',['clean'], function(){
    return gulp.src('./html/*.html')
        .pipe(gulp.dest('dist'));
});


gulp.task('combineTools', ['clean'], function(){
    return gulp.src('./tools/**/*.js')
        .pipe(concat('tools.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js/'));

});

gulp.task('combineCSS', ['clean'], function(){
    return gulp.src('./css/**/*.css')
        .pipe(concat('combined.css'))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('default', ['clean','combineTools', 'combineCSS', 'moveHTML']);