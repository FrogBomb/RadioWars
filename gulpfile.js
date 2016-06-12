var gulp = require('gulp');
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var del = require('del');
var insert = require('gulp-insert');

gulp.task('clean', function(){
    return del(['./dist/**/*']);
});

gulp.task('handlebars', ['clean'], function(){
  gulp.src('./frontend/hbsTemplates/*.hbs')
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'RadioWars.templates',
      noRedeclare: true, // Avoid duplicate declarations 
    }))
    .pipe(concat('hbsTemplates.js'))
  	.pipe(uglify())
    .pipe(gulp.dest('dist/js/'));
});


gulp.task('moveHTML',['clean'], function(){
    return gulp.src('./frontend/*.html')
        .pipe(gulp.dest('dist'));
});


gulp.task('combineFrontendJs', ['clean'], function(){
    return gulp.src('./frontend/js/**/*.js')
        .pipe(concat('compiled.js'))
//		.pipe(insert.wrap(";(function(){","\n})();")) Need to generate page to do
        .pipe(uglify())
        .pipe(gulp.dest('dist/js/'));
});

gulp.task('combineCSS', ['clean'], function(){
    return gulp.src('./frontend/css/**/*.css')
        .pipe(concat('combined.css'))
        .pipe(gulp.dest('dist/css/'));
});

gulp.task('moveIndexJS', ['clean'], function(){
	return gulp.src('./server/index.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('moveServerJSON', ['clean'], function(){
	return gulp.src('./server/*.json')
		.pipe(gulp.dest('dist'));
});
gulp.task('movePackageJSON', ['clean'], function(){
	return gulp.src('./package.json')
		.pipe(gulp.dest('dist'));
});
gulp.task('moveConfigFile', ['clean'], function(){
	return gulp.src('./server/config.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});
gulp.task('moveMaps', ['clean'], function(){
	return gulp.src('./server/maps/*.json')
		.pipe(gulp.dest('dist/maps'));
});


		  
gulp.task('default', ['clean','handlebars', 'moveHTML','movePackageJSON', 'combineFrontendJs', 'combineCSS', 'moveIndexJS', 'moveServerJSON', 'moveMaps']);