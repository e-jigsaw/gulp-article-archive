(function() {
  var async, fs, gutil, mkdir, path, through, _;

  gutil = require('gulp-util');

  through = require('through2');

  path = require('path');

  mkdir = require('mkdirp');

  fs = require('fs');

  async = require('async');

  _ = require('lodash');

  module.exports = function(dest) {
    var transform;
    transform = function(file, encoding, done) {
      return fs.readdir(file.path, function(err, posts) {
        return async.map(posts, function(post, callback) {
          return fs.readFile("" + file.path + "/" + post, function(err, file) {
            var res, url;
            url = /^(\d{4})-(\d{2})-(\d{2})-(.*)\.md/.exec(post);
            res = {
              filename: post,
              url: "/" + url[1] + "/" + url[2] + "/" + url[3] + "/" + url[4] + ".html",
              title: /^# \[(.*)\]/.exec(file.toString().split('\n')[0])[1],
              year: url[1],
              month: url[2]
            };
            return callback(err, res);
          });
        }, function(err, posts) {
          var allArchive, allWrite, i, monthWrite, monthlyArchive, yearWrite, yearlyArchive;
          posts = posts.reverse();
          allArchive = (function() {
            var _i, _ref, _results;
            _results = [];
            for (i = _i = 0, _ref = posts.length / 20; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
              _results.push(posts.slice(i * 20, ((i + 1) * 20) - 1));
            }
            return _results;
          })();
          yearlyArchive = _.groupBy(posts, function(post) {
            return post.year;
          });
          monthlyArchive = _.groupBy(posts, function(post) {
            return "" + post.year + "-" + post.month;
          });
          allArchive = allArchive.map(function(posts, index) {
            return {
              index: index,
              posts: posts,
              isHead: false,
              isLast: false
            };
          });
          allArchive[0].isLast = allArchive[allArchive.length - 1].isHead = true;
          _.each(_.keys(yearlyArchive), function(key) {
            return yearlyArchive[key] = {
              year: key,
              posts: yearlyArchive[key]
            };
          });
          _.each(_.keys(monthlyArchive), function(key) {
            var splitedKey;
            splitedKey = key.split('-');
            return monthlyArchive[key] = {
              year: splitedKey[0],
              month: splitedKey[1],
              posts: monthlyArchive[key]
            };
          });
          mkdir.sync(dest);
          allWrite = function(archive, cb) {
            return fs.writeFile(path.resolve(dest, "page-" + archive.index + ".json"), JSON.stringify(archive), function(err) {
              if (err != null) {
                return cb(err);
              } else {
                return cb(null);
              }
            });
          };
          yearWrite = function(key, cb) {
            return fs.writeFile(path.resolve(dest, "" + key + ".json"), JSON.stringify(yearlyArchive[key]), function(err) {
              if (err != null) {
                return cb(err);
              } else {
                return cb(null);
              }
            });
          };
          monthWrite = function(key, cb) {
            return fs.writeFile(path.resolve(dest, "" + key + ".json"), JSON.stringify(monthlyArchive[key]), function(err) {
              if (err != null) {
                return cb(err);
              } else {
                return cb(null);
              }
            });
          };
          return async.parallel([
            function(callback) {
              return async.each(allArchive, allWrite, function(err) {
                return callback(err);
              });
            }, function(callback) {
              return async.each(_.keys(yearlyArchive), yearWrite, function(err) {
                return callback(err);
              });
            }, function(callback) {
              return async.each(_.keys(monthlyArchive), monthWrite, function(err) {
                return callback(err);
              });
            }
          ], function(err) {
            return done(err, file);
          });
        });
      });
    };
    return through.obj(transform);
  };

}).call(this);
