var path = require('path')
var crypto = require('crypto')
var through = require('through2')

module.exports = function webpackStats (b) {
  var stats = null
  var startTime
  var chunkId
  function init () {
    stats = {
      errors: [],
      warnings: [],
      version: '1.0.0',
      publicPath: '',
      assets: [],
      entrypoints: {},
      chunks: [],
      modules: []
    }
    startTime = Date.now()
    chunkId = 0
  }

  var mainBundleName = 'bundle.js'
  if (b.argv) mainBundleName = b.argv.o || b.argv.outfile || mainBundleName

  b.on('reset', addHooks)
  b.on('split.pipeline', addChunk)
  b.on('factor.pipeline', addChunk)
  addHooks()

  function addHooks () {
    init()

    addChunk(mainBundleName, b.pipeline)
    b.pipeline.get('wrap').on('end', function () {
      require('fs').writeFile('stats.json', JSON.stringify(stats, null, 2), function () {})
    })
  }
  function addChunk (name, pipeline) {
    var totalSize = 0
    var chunk = {
      id: chunkId++,
      rendered: true,
      initial: true,
      entry: true,
      extraAsync: false,
      size: 0,
      names: [ name.replace(/\.[a-z]*$/, '') ],
      files: [],
      hash: '',
      modules: [],
    }
    var hash = crypto.createHash('sha512')
    pipeline.get('pack').unshift(through.obj(onmodule, onmodulesend))
    pipeline.get('wrap').push(through(ondata, onchunkend))

    function onmodule (row, enc, cb) {
      var relative = path.relative(b._options.basedir || process.cwd(), row.file)
      var match = /^(\.\.\/)+(.*?)\/browserify\/(lib|node_modules)\//.exec(relative)
      if (match) {
        relative = '(browserify)/' + match[3] + '/' + relative.slice(match[0].length)
      }
      if (!relative.includes('(browserify') && !relative.includes('node_modules/')) {
        chunk.files.push(relative)
      }
      if (!/^\.\.?\//.test(relative) && !relative.startsWith('(browserify)') && !path.isAbsolute(relative)) {
        relative = './' + relative
      }
      var module = {
        id: row.id,
        identifier: row.file,
        name: relative,
        chunks: [chunk.id],
        chunkNames: chunk.names,
        source: row.source,
        size: Math.max(1, row.source.length)
      }
      chunk.modules.push(module)
      stats.modules.push(module)
      cb(null, row)
    }

    function onmodulesend (done) {
      chunk.size = chunk.modules.reduce(function (s, r) { return s + r.size }, 0)
      done()
    }

    function ondata (chunk, enc, cb) {
      hash.update(chunk)
      totalSize += chunk.length
      cb(null, chunk)
    }
    function onchunkend (done) {
      chunk.hash = hash.digest('hex')
      stats.chunks.push(chunk)
      stats.assets.push({
        name: name,
        size: totalSize,
        chunks: [chunk.id],
        chunkNames: chunk.names,
        emitted: true
      })
      done()
    }
  }
}
