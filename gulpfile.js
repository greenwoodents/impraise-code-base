// Include gulp
var gulp = require('gulp');

// Include Plugins
var less = require('gulp-less');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var path = require('path');



// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src('scripts/*.js')
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('template/scripts/'))
});

gulp.task('scripts-min', function() {
    return gulp.src('scripts/*.js')
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('template/scripts/'))
});

gulp.task('less', function() {
  return gulp.src('less/main.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(gulp.dest('./template/styles'));
});




gulp.task('watch', function() {
    gulp.watch('scripts/*.js', [ 'scripts']);
    gulp.watch('less/**/*.less', ['less']);
});

gulp.task('default', ['less','scripts', 'watch']);
gulp.task('build', ['less','scripts-min']);
