assert = require 'power-assert'
archive = require '../src/index.coffee'
gutil = require 'gulp-util'
fs = require 'fs'

it 'should archive pages', (done)->
  stream = archive 'test/archive'

  stream.once 'data', (file)-> fs.readdir 'test/archive', (err, files)->
    assert.deepEqual files, ['2013-01.json', '2013-02.json', '2013.json', '2014-01.json', '2014-02.json', '2014.json', 'page-0.json']
    done()

  stream.write new gutil.File
    path: 'test/fixtures'
