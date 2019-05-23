const path = require('path')
const posthtml = require('posthtml')
const {
  shouldProcess,
  replaceEjsDelimeters,
  wrapData,
  slash
} = require('./utils')

const isProd = process.env.NODE_ENV === 'production'

const templateModulePath = require.resolve('lodash/template')
const templateSettingsModulePath = require.resolve('./template-settings')

const transform = ({ loader }) => tree => {
  let assetIndex = 0

  const updateNodeSource = (node, key) => {
    const value = node.attrs[key]
    if (shouldProcess(value)) {
      node.attrs[key] = wrapData(
        `=getStaticAsset('${slash(path.join(loader.context, value))}')`
      )
    }
  }

  const walker = node => {
    node.attrs = node.attrs || {}

    if (node.tag === 'link' && node.attrs.rel === 'stylesheet') {
      if (isProd) {
        // In production mode, replace the tag with actual webpack chunk
        if (shouldProcess(node.attrs.href)) {
          node.attrs.href = wrapData(`=htmlAsset['css' + ${assetIndex}]`)
          assetIndex++
        }
        return node
      }
      // In dev mode, chunks are automatically dynamically injected
      // So we only return the node if it's not processed by webpack
      return shouldProcess(node.attrs.href) ? null : node
    }
    if (node.tag === 'script' && node.attrs.src) {
      if (isProd) {
        // In production mode, replace the tag with actual webpack chunk
        if (shouldProcess(node.attrs.src)) {
          node.attrs.src = wrapData(`=htmlAsset['js' + ${assetIndex}]`)
          assetIndex++
        }
        return node
      }
      // In dev mode, chunks are automatically dynamically injected
      // So we only return the node if it's not processed by webpack
      return shouldProcess(node.attrs.src) ? null : node
    }
    if (node.tag === 'img') {
      updateNodeSource(node, 'src')
    }
    if (node.tag === 'video') {
      updateNodeSource(node, 'src')
      updateNodeSource(node, 'poster')
    }
    if (node.tag === 'image') {
      updateNodeSource(node, 'xlink:href')
    }
    if (node.tag === 'source') {
      updateNodeSource(node, 'src')
    }
    return node
  }

  tree.walk(walker)
}

module.exports = async function(content) {
  const done = this.async()
  try {
    const { html } = await posthtml()
      .use(transform({ loader: this }))
      .process(replaceEjsDelimeters(content), { recognizeSelfClosing: true })
    done(
      null,
      `
  const template = require("${slash(templateModulePath)}")
  const templateSettings = require("${slash(templateSettingsModulePath)}")
  export default function (data) {
    const { publicPath } = data.htmlWebpackPlugin.files
    data.htmlAsset = {}
    data.getStaticAsset = file => {
      for (const m of data.compilation._modules.values()) {
        if (m.rawRequest === file) {
          const _module = { exports: {} }
          const fn = new Function('module', m._source._value.replace('__webpack_public_path__', JSON.stringify(publicPath)))
          fn(_module)
          return _module.exports
        }
      }
    }
    const files = Object.keys(data.compilation.assets)
    const INDEX_RE = /\\/html-asset-(\\d+)\\//
    const TYPE_RE = /\\.(css|js)$/
    for (const file of files) {
      if (INDEX_RE.test(file) && TYPE_RE.test(file)) {
        const [, index] = INDEX_RE.exec(file)
        const [, type] = TYPE_RE.exec(file)
        data.htmlAsset[type + index] = publicPath + file
      }
    }
    return template(${JSON.stringify(html)}, templateSettings)(data)
  }`
    )
  } catch (error) {
    done(error)
  }
}
