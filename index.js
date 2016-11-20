var through2 = require('through2');
var lazypipe = require('lazypipe');
var read = require('gulp-read');
var assign = require('lodash.assign');
var path = require('path');

function relativePath(vinylFile) {
  return path.relative(vinylFile.base, vinylFile.path);
}

function collectFiles(gulp, glob, options) {
  var collectedFiles = {};
  var ended = false;

  var srcOptions = assign({}, options, {read:false});
  gulp().src(glob, srcOptions)
    .on('data', function(file) {
       collectedFiles[relativePath(file)] = file;
    })
    .on('end', function() {
      ended = true;
      fns.map(function(fn) {
        fn(collectedFiles);
      });
    });

  var fns = [];

  return function(fn) {
    if (ended) {
      return fn(collectedFiles);
    }
    fns.push(fn);
  };
}


function emitRemainingFiles(whenFilesCollected) {
  return function(cb) {
    var _this = this;
    whenFilesCollected(function(remainingFiles) {
      Object.keys(remainingFiles).map(function(remainingFilePath) {
        _this.push(remainingFiles[remainingFilePath]);
      });
      cb();
    });
  }
}

function overlayWith(gulp, glob, options) {
  var whenFilesCollected = collectFiles(gulp, glob, options);

  function emitOverlayedFiles(baseFile, enc, cb) {
    whenFilesCollected(function(overlayFiles) {
      var baseFilePath = relativePath(baseFile);
      var overlayFile = overlayFiles[baseFilePath];
      if (overlayFile) {
        delete overlayFiles[baseFilePath];
        cb(null, overlayFile);
      } else {
        cb(null, baseFile);
      }
    });
  }

  return through2.obj(emitOverlayedFiles,
    emitRemainingFiles(whenFilesCollected));
}

function requireGulp() {
  try {
    return require('gulp');
  } catch (e) {
    return null;
  }
}

function initOverlayPipe(gulp, overlayFn) {
  return function(globs, options) {
    var options = options || {};
    var overlayPipe = lazypipe().pipe(overlayFn, gulp, globs, options);
    if (options.read !== false) {
      overlayPipe = overlayPipe.pipe(read);
    }
    return overlayPipe(); 
  };
}

function create(gulp) {
  gulp = (gulp) ? function() { return gulp } : requireGulp; 

  return {
    with: initOverlayPipe(gulp, overlayWith),
    //onto: initOverlayPipe(gulp, overlayOnto),
    use: create
  }
}

module.exports = create();
