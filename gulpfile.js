var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var inject = require('gulp-inject');
var del = require('del');

var uniqueId = (new Date()).getTime();
var styleId;

gulp.task('styles', function() {
    var taskBuild = gulp.src('assets/sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('public/assets/css'));

    // inject new js file into index.html
    var target = gulp.src('./public/index.html');
    var sourceCss = gulp.src('./public/assets/css/chava.css', { read: false });

    var taskInject = target.pipe(inject(sourceCss, { relative: true }))
        .pipe(gulp.dest('public'));

    return taskBuild && taskInject;
});

gulp.task('scripts', function() {
    // concatenate and minify scripts
    var taskBuild = gulp.src([
            'assets/js/lazyload.min.js',
            'assets/js/hammer.2.0.6.min.js',
            'assets/js/chava.js'
        ])
        .pipe(sourcemaps.init())
        .pipe(concat('chava.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/assets/js'));

    // inject new js file into index.html
    var target = gulp.src('./public/index.html');
    var sourceJs = gulp.src('./public/assets/js/chava.js', { read: false });

    var taskInject = target.pipe(inject(sourceJs, { relative: true }))
        .pipe(gulp.dest('public'));

    return taskBuild && taskInject;
});

gulp.task('photos', function() {
    return gulp.src('assets/photos/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('public/assets/photos'));
});

gulp.task('images', function() {
    return gulp.src('assets/images/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('public/assets/images'))
});

// rename js to cache-bustin' type name
gulp.task('deploy_rename_js', function() {
    // rename distribution js with unique name for bustin' teh caches
    return gulp.src(['public/assets/js/chava.js'])
        .pipe(rename({
            suffix: '-' + uniqueId
        }))
        .pipe(gulp.dest('public/assets/js'));
});

gulp.task('deploy_rename_css', function() {
    return gulp.src(['public/assets/css/chava.css'])
        .pipe(rename({
            suffix: '-' + uniqueId
        }))
        .pipe(gulp.dest('public/assets/css'));
});

gulp.task('deploy_inject', ['deploy_rename_js', 'deploy_rename_css'], function() {
    var target = gulp.src('./public/index.html');

    var sources = gulp.src([
        './public/assets/css/chava-' + uniqueId + '.css',
        './public/assets/js/chava-' + uniqueId + '.js'
    ], { read: false });

    return target.pipe(inject(sources, { relative: true }))
        .pipe(gulp.dest('./public'));
})

gulp.task('deploy', ['deploy_inject'], function() {
    // remove old js files (but keep non-cache-bustin' original just in case)
    del(['public/assets/js/chava-*.js', '!public/assets/js/chava-' + uniqueId + '.js']).then(paths => {
        console.log('Deleted old JS files: \n', paths.join('\n'));
    });

    del(['public/assets/css/chava-*.css', '!public/assets/css/chava-' + uniqueId + '.css']).then(paths => {
        console.log('Deleted old CSS files: \n', paths.join('\n'));
    });
})

gulp.task('default', function() {
    gulp.watch('assets/sass/*.scss', ['styles']);
    gulp.watch('assets/js/*.js', ['scripts']);
});
