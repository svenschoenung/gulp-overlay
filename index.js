var through2 = require('through2');
var path = require('path');

function relativePath(vinylFile) {
  return path.relative(vinylFile.base, vinylFile.path);
}

function collectFiles(stream) {
  var collectedFiles = {};
  var ended = false;

  stream
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
  };
}

function overlayWith(stream) {
  var whenFilesCollected = collectFiles(stream);

  function emitOverlayedFiles(baseFile, enc, cb) {
    whenFilesCollected(function(overlayFiles) {
      var baseFilePath = relativePath(baseFile);
      var overlayFile = overlayFiles[baseFilePath];
      if (overlayFile) {
        delete overlayFiles[baseFilePath];
        return cb(null, overlayFile);
      } else {
        return cb(null, baseFile);
      }
    });
  }

  return through2.obj(emitOverlayedFiles,
    emitRemainingFiles(whenFilesCollected));
}

function overlayOnto(stream) {
  var whenFilesCollected = collectFiles(stream);

  function emitOverlayedFiles(overlayFile, enc, cb) {
    whenFilesCollected(function(baseFiles) {
      var overlayFilePath = relativePath(overlayFile);
      var baseFile = baseFiles[overlayFilePath];
      if (baseFile) {
        delete baseFiles[overlayFilePath];
      }
      cb(null, overlayFile);
    });
  }

  return through2.obj(emitOverlayedFiles,
    emitRemainingFiles(whenFilesCollected));
}



module.exports = {
  with: overlayWith,
  onto: overlayOnto
};
