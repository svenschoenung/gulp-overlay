[![npm Version](https://img.shields.io/npm/v/gulp-overlay.svg)](https://www.npmjs.com/package/gulp-overlay)
[![Build Status](https://travis-ci.org/svenschoenung/gulp-overlay.svg?branch=master)](https://travis-ci.org/svenschoenung/gulp-overlay)
[![Coverage Status](https://coveralls.io/repos/github/svenschoenung/gulp-overlay/badge.svg?branch=master)](https://coveralls.io/github/svenschoenung/gulp-overlay?branch=master)
[![Dependency Status](https://david-dm.org/svenschoenung/gulp-overlay.svg)](https://david-dm.org/svenschoenung/gulp-overlay)
[![devDependency Status](https://david-dm.org/svenschoenung/gulp-overlay/dev-status.svg)](https://david-dm.org/svenschoenung/gulp-overlay#info=devDependencies)
[![Code Climate](https://codeclimate.com/github/svenschoenung/gulp-overlay/badges/gpa.svg)](https://codeclimate.com/github/svenschoenung/gulp-overlay)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/8e9503cff73646f3abe1b7d557d357e1)](https://www.codacy.com/app/svenschoenung/gulp-overlay)

# gulp-overlay

Merge two gulp streams by overlaying one onto the other.

<img src="overlay.png" width="600" />

## Installation

```
npm install --save-dev gulp-overlay
```

## Usage

Assume the following folder structure:
 
```
src/
  common/
    menu.html
    main.html
    footer.html
    pages/
      about.html
  project1/
    menu.html
    main.html
    pages/
      about.html
      tos.html
  project2/
    main.html
    footer.html
    pages/
      legal.html
```

You can use `overlay.with()` to overlay `project1/` on top of `common/`. Files in `project1/` will overwrite the corresponding files in `common/`.

```javascript
var overlay = require('gulp-overlay');

gulp.task('build-project1', function() {
  return gulp.src('src/common/**/*.html')
    .pipe(overlay.with(gulp.src('src/project1/**/*.html')))
    .pipe(gulp.dest('dist/project1'));
});

gulp.task('build-project2', function() {
  return gulp.src('src/common/**/*.html')
    .pipe(overlay.with(gulp.src('src/project2/**/*.html')))
    .pipe(gulp.dest('dist/project2'));
});
```

Alternatively you can use `overlay.onto()` to do the same thing:

```javascript
var overlay = require('gulp-overlay');

gulp.task('build-project1', function() {
  return gulp.src('src/project1/**/*.html')
    .pipe(overlay.onto(gulp.src('src/common/**/*.html')))
    .pipe(gulp.dest('dist/project1'));
});

gulp.task('build-project2', function() {
  return gulp.src('src/project2/**/*.html')
    .pipe(overlay.onto(gulp.src('src/common/**/*.html')))
    .pipe(gulp.dest('dist/project2'));
});
```

The result in both cases is the following:

```
dist/
  project1/
    menu.html     1
    main.html     1
    footer.html   *
    pages/
      about.html  1
      tos.html    1
  project2/
    menu.html     *
    main.html     2
    footer.html   2
    pages/
      about.html  *
      legal.html  2
```
          
`*`: files from the `src/common/` directory  
`1`: files from the `src/project1/` directory  
`2`: files from the `src/project2/` directory

### Minimizing memory utilization

`gulp-overlay` doesn't need file contents to do its job. It is therefore recommended that you defer reading file contents by providing the `read:false` option to `gulp.src()`. You can read the file contents later by placing [`gulp-read`](http://github.com/svenschoenung/gulp-read) somewhere after `gulp-overlay` in your stream:

```javascript
var overlay = require('gulp-overlay');
var read = require('gulp-read');
  
gulp.task('build-project1', function() {
  return gulp.src('src/project1/**/*.html', {read:false})
    .pipe(overlay.onto(gulp.src('src/common/**/*.html', {read:false})))
    .pipe(read())
    .pipe(gulp.dest('dist/project1'));
});
```

Since all files of the second stream have to be stored in memory for `gulp-overlay` to work, this potentially saves a lot of memory when dealing with a large number of files.

This also has the added benefit that not all the file contents have to be read, since some files will be replaced by others anyway. 

### Enforcing file order

`gulp-overlay` can only keep the ordering of the first stream. Any remaining files from the second stream will be emitted afterwards and in no particular order. 
If the order of files is important in your stream, you should place [`gulp-order`](https://npmjs.com/package/gulp-order) or [`gulp-sort`](https://npmjs.com/package/gulp-sort) somewhere after `gulp-overlay`:

```javascript
var overlay = require('gulp-overlay');
var order = require('gulp-order');

gulp.task('build-project1', function() {
  return gulp.src('src/project1/**/*.js')
    .pipe(overlay.onto(gulp.src('src/common/**/*.js')))
    .pipe(order(['vendor/**/*.js', 'app/**/*.js']))
    .pipe(gulp.dest('dist/project1'));
});
```

## License

[MIT](LICENSE)
