'use strict';

const gulp = require('gulp'),
  ts = require('gulp-typescript');

gulp.task('default', () => {
  return gulp.src('src/*.ts')
    .pipe(ts({}))
    .pipe(gulp.dest('dist/src'));
});

gulp.task('watch', () => {
  gulp.watch('src/*.ts', ['default']);
});
