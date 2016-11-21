'use strict';

/* global describe:false, it:false */

var chai = require('chai');
var expect = chai.expect;

var gulp = require('gulp');
var gutil = require('gulp-util');
var overlay = require('./index.js');
var path = require('path');

function extractResults(files) {
  var results = {};
  files.forEach(function(file) {
    var relativePath = path.relative(file.base, file.path);
    results[relativePath] = file.contents.toString().trim();
  });
  return results;
}

describe('overlay.with', function() {
  it('should replace files in baseFolder ' +
     'with files in overlayFolder', function(done) {

    gulp.src('test/baseFolder/**/*.txt')
      .pipe(overlay.with(gulp.src('test/overlayFolder1/**/*.txt')))
      .pipe(overlay.with(gulp.src('test/overlayFolder2/**/*.txt')))
      .pipe(gutil.buffer(function(err, files) { 
	if (err) {
	  return done(err);
	}
        expect(extractResults(files)).to.eql({
          'file1.txt': 'baseFolder/file1.txt',
          'file2.txt': 'overlayFolder2/file2.txt',
          'file3.txt': 'overlayFolder1/file3.txt',
          'folder1/file1.txt': 'baseFolder/folder1/file1.txt',
          'folder1/file2.txt': 'overlayFolder1/folder1/file2.txt',
          'folder1/file3.txt': 'overlayFolder1/folder1/file3.txt',
          'folder2/file1.txt': 'overlayFolder1/folder2/file1.txt',
          'folder2/file2.txt': 'overlayFolder2/folder2/file2.txt'
        });
        done();
      }));
  });
});

describe('overlay.onto', function() {
  it('should replace files in baseFolder ' +
     'with files in overlayFolder', function(done) {

    gulp.src('test/overlayFolder2/**/*.txt')
      .pipe(overlay.onto(gulp.src('test/overlayFolder1/**/*.txt')))
      .pipe(overlay.onto(gulp.src('test/baseFolder/**/*.txt')))
      .pipe(gutil.buffer(function(err, files) { 
	if (err) {
	  return done(err);
	}
        expect(extractResults(files)).to.eql({
          'file1.txt': 'baseFolder/file1.txt',
          'file2.txt': 'overlayFolder2/file2.txt',
          'file3.txt': 'overlayFolder1/file3.txt',
          'folder1/file1.txt': 'baseFolder/folder1/file1.txt',
          'folder1/file2.txt': 'overlayFolder1/folder1/file2.txt',
          'folder1/file3.txt': 'overlayFolder1/folder1/file3.txt',
          'folder2/file1.txt': 'overlayFolder1/folder2/file1.txt',
          'folder2/file2.txt': 'overlayFolder2/folder2/file2.txt'
        });
        done();
      }));
  });
});
