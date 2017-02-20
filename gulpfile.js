// Include gulp
var gulp = require('gulp');

// Include plugins
var concat = require('gulp-concat');
var ugligy = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('default', function() {
    return gulp.src('src/core/*.js')
        .pipe(concat('geoshare.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(ugligy())
        .pipe(gulp.dest('build'))
});