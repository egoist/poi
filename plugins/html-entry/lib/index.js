const path = require('path')
const fs = require('fs-extra')
const posthtml = require('posthtml')
const { shouldProcess, replaceEjsDelimeters, slash } = require('./utils')

exports.name = 'html-entry'

const htmlEntryLoader = require.resolve('./html-entry-loader')

exports.apply = api => {
  let server

  api.hook('createServer', context => {
    server = context.server
  })

  api.hook('createWebpackChain', chain => {
    chain.module
      .rule('import-json-from-html-entry')
      .resourceQuery(/imported-from-html-entry/)
      .test(/\.json$/)
      .type('javascript/auto')
  })

  api.hook('createConfig', config => {
    if (!Array.isArray(config.entry)) {
      return
    }

    const HTML_RE = /\.(html|pug)$/
    const restFiles = []
    let htmlFile
    config.entry.forEach(file => {
      if (HTML_RE.test(file)) {
        htmlFile = api.resolveCwd(file)
      } else {
        restFiles.push(api.resolveCwd(file))
      }
    })

    if (!htmlFile) {
      return
    }

    const tempFile = path.resolve('node_modules/.cache/html-entry/index.js')
    config.entry = [tempFile]

    writeTempFile({ tempFile, htmlFile, restFiles })

    if (api.cli.options.serve || api.cli.options.watch) {
      const watcher = require('chokidar').watch(htmlFile, {
        ignoreInitial: true
      })
      watcher.on('change', () => {
        writeTempFile({ tempFile, htmlFile, restFiles })
        if (server) {
          server.sockWrite(server.sockets, 'content-changed')
        }
      })
    }

    const loaders = [htmlEntryLoader]
    if (htmlFile.endsWith('.pug')) {
      loaders.push('pug-plain-loader')
    }
    config.output.html = config.output.html || {}
    Object.assign(config.output.html, {
      template: `!!${loaders.join('!')}!${htmlFile}`
    })
  })
}

function writeTempFile({ tempFile, htmlFile, restFiles }) {
  const assets = []
  const staticAssets = []

  const addAsset = value => {
    if (shouldProcess(value)) {
      assets.push(path.join(path.dirname(htmlFile), value))
    }
  }

  const addStaticAsset = value => {
    if (shouldProcess(value)) {
      staticAssets.push(path.join(path.dirname(htmlFile), value))
    }
  }

  posthtml()
    .use(tree => {
      tree.walk(node => {
        node.attrs = node.attrs || {}
        if (node.tag === 'link') {
          if (node.attrs.rel === 'stylesheet') {
            addAsset(node.attrs.href)
          } else {
            addStaticAsset(node.attrs.href)
          }
        }
        if (node.tag === 'script') {
          addAsset(node.attrs.src)
        }
        if (node.tag === 'img') {
          addStaticAsset(node.attrs.src)
        }
        if (node.tag === 'image') {
          addStaticAsset(node.attrs['xlink:href'])
        }
        if (node.tag === 'video') {
          addStaticAsset(node.attrs.src)
          addStaticAsset(node.attrs.poster)
        }
        if (node.tag === 'source') {
          addStaticAsset(node.attrs.source)
        }
        return node
      })
    })
    .process(replaceEjsDelimeters(fs.readFileSync(htmlFile, 'utf8')), {
      sync: true
    })

  fs.outputFileSync(
    tempFile,
    `
    var assets = []

    ${staticAssets
      .map((file, index) => {
        const query = file.includes('?')
          ? `&imported-from-html-entry`
          : `?imported-from-html-entry`
        return `require("!file-loader?name=assets/static/html-static-asset/${index}--[name].[ext]!${slash(
          file
        )}${query}")`
      })
      .join('\n')}
    ${restFiles
      .map(file => {
        return `require("${slash(file)}")`
      })
      .join('\n')}
    ${assets
      .map((file, index) => {
        return `assets.push(function(){
          return import(/* webpackChunkName: "html-asset/${index}--${path.basename(
          file,
          path.extname(file)
        )}" */ "${slash(file)}")
        })`
      })
      .join('\n')}

    assets.reduce(function(current, next){
      return current.then(next)
    }, Promise.resolve())
    `,
    'utf8'
  )
}
