const gulp = require('gulp');
const handlebars = require('gulp-handlebars');
const wrap = require('gulp-wrap');
const declare = require('gulp-declare');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const del = require('del');

gulp.task('clean', function () {
  return del(['./dist/**/*']);
});

gulp.task('handlebars', function () {
  return gulp.src('./frontend/hbsTemplates/*.hbs')
    .pipe(handlebars({handlebars: require("handlebars")}))
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'RadioWars.templates',
      noRedeclare: true, // Avoid duplicate declarations 
    }))
    .pipe(concat('hbsTemplates.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js/'));
});


gulp.task('moveHTML', function () {
  return gulp.src('./frontend/*.html')
    .pipe(gulp.dest('dist'));
});


gulp.task('combineFrontendJs', function () {
  return gulp.src('./frontend/js/**/*.js')
    .pipe(concat('compiled.js'))
    //		.pipe(insert.wrap(";(function(){","\n})();")) Need to generate page to do
    .pipe(uglify())
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('combineCSS', function () {
  return gulp.src('./frontend/css/**/*.css')
    .pipe(concat('combined.css'))
    .pipe(gulp.dest('dist/css/'));
});

gulp.task('moveIndexJS', function () {
  return gulp.src('./server/index.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('moveServerJSON', function () {
  return gulp.src('./server/*.json')
    .pipe(gulp.dest('dist'));
});
gulp.task('movePackageJSON', function () {
  return gulp.src('./package.json')
    .pipe(gulp.dest('dist'));
});
gulp.task('moveConfigFile', function () {
  return gulp.src('./server/config.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});
gulp.task('moveMaps', function () {
  return gulp.src('./server/maps/*.json')
    .pipe(gulp.dest('dist/maps'));
});


gulp.task('default', gulp.series(
  'clean',
  gulp.parallel(
    gulp.series('handlebars', 'moveHTML'),
    'movePackageJSON', 
    'combineFrontendJs', 
    'combineCSS', 
    'moveIndexJS', 
    'moveServerJSON', 
    'moveMaps'
  )
));

