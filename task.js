var path = require('path'),
	gulp = require('gulp'),
	browserify = require('gulp-browserify');

var schemaPath = 'models/schemes/*.js',
	angularModelPath = 'webpanel/app/models.raw/*.js',
	angularModelOut = 'webpanel/app/models',
	angularSchemeOut = 'webpanel/app/models.raw/schemes';

gulp.task('schemes.client', function(){
	gulp.src(schemaPath, {base: 'models/schemes'})
		.pipe(gulp.dest(angularSchemeOut))
});

gulp.task('models.client', function() {
	gulp.src(angularModelPath)
		.pipe(browserify())
		.pipe(gulp.dest(angularModelOut))
});

gulp.task('watch', function() {
	gulp.watch(schemaPath, ['schemes.client', 'model.client']);
	gulp.watch(angularModelPath, ['model.client']);
});

gulp.task('default', ['watch', 'schemes.client', 'models.client']);