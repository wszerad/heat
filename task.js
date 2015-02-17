var path = require('path'),
	gulp = require('gulp'),
	browserify = require('gulp-browserify'),
	sections = require('gulp-sections');

var schemaPath = 'models/schemes/*.js',
	angularModelPath = 'webpanel/app/models.raw/*.js',
	angularModelOut = 'webpanel/app/models',
	angularSchemeOut = 'webpanel/app/models.raw/schemes';

	//modelsPath = 'models.draft/*.js',
	//mainScript = 'webpanel/jsraw/*.js'

gulp.task('schemes.client', function(){
	gulp.src(schemaPath, {base: 'models/schemes'})
		.pipe(gulp.dest(angularSchemeOut))
});

gulp.task('models.client', function() {
	gulp.src(angularModelPath)
		.pipe(browserify())
		.pipe(gulp.dest(angularModelOut))
});

/*
gulp.task('schemes.db', function(){
	gulp.src(schemaPath, {base: 'models.draft/schemes'})
		.pipe(sections({sections: {
			db: {
				filename: true
			}
		}}))
		.pipe(gulp.dest('models/schemes/'))
});

gulp.task('models.db', function() {
	gulp.src(modelsPath, {base: 'models.draft'})
		.pipe(sections({sections: {
			db: {
				filename: true
			}
		}}))
		.pipe(gulp.dest('models/'))
});*/



/*
gulp.task('main', function() {
	gulp.src(mainScript)
		.pipe(browserify())
		.pipe(gulp.dest('webpanel/js'))
});
*/

gulp.task('watch', function() {
	//gulp.watch(modelsPath, ['models.db']);
	gulp.watch(schemaPath, ['schemes.client', 'model.client']);
	gulp.watch(angularModelPath, ['model.client']);
	//gulp.watch(mainScript, ['main']);
});

gulp.task('default', ['watch', 'schemes.client', 'models.client']);