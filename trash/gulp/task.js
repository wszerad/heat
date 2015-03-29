var gulp = require('gulp');
var changed = require('gulp-changed');

var SRC = 'src/*.js';
var DEST = 'dist';

gulp.task('default', function () {
	return gulp.src(SRC)
		.pipe(changed(DEST))
		// ngmin will only get the files that
		// changed since the last time it was run
		.pipe(ngmin())
		.pipe(gulp.dest(DEST));
});