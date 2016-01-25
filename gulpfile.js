var gulp       = require('gulp')
  , gutil      = require('gulp-util')
  , source     = require('vinyl-source-stream')
  , buffer     = require('vinyl-buffer')
  , browserify = require('browserify')
  , watchify   = require('watchify')
  , browserSync = require('browser-sync').create()

gulp.task('bundle', function () {
  var b = browserify({
    entries: 'src/metablog.js',
    paths: [ 'src' ],
    standalone: 'metablog'
  })

  return b.bundle()
    .pipe(source('metablog.bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist/'))
})

gulp.task('bundle:watch', function () {
  var b = watchify(browserify({
    entries: [ 'src/metablog.js' ],
    standalone: 'metablog'
  }))

  function bundle () {
    b.bundle()
      .on('error', gutil.log)
      .pipe(source('metablog.bundle.js'))
      .pipe(buffer())
      .pipe(gulp.dest('dist/'))
      .pipe(browserSync.reload({ stream: true }))
  }

  b.on('update', bundle)
  b.on('log', gutil.log)

  bundle()
})

gulp.task('watch', function () {
  browserSync.init({
    server: './dist'
  })
})

gulp.task('develop', ['bundle:watch', 'watch']);
