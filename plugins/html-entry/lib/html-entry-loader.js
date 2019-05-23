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

const transform = () => tree => {
  let assetIndex = 0
  let staticAssetIndex = 0

  const updateNodeSource = (node, key) => {
    const value = node.attrs[key]
    if (shouldProcess(value)) {
      node.attrs[key] = wrapData(`=htmlStaticAsset[${staticAssetIndex}]`)
      staticAssetIndex++
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
    if (node.tag === 'link') {
      updateNodeSource(node, 'href')
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
    data.htmlStaticAsset = {}
    const files = Object.keys(data.compilation.assets)
    const ASSET_RE = /\\/html-asset\\/(\\d+)--/
    const STATIC_ASSET_RE = /\\/html-static-asset\\/(\\d+)--/
    const TYPE_RE = /\\.(css|js)$/
    for (const file of files) {
      if (ASSET_RE.test(file) && TYPE_RE.test(file)) {
        const [, index] = ASSET_RE.exec(file)
        const [, type] = TYPE_RE.exec(file)
        data.htmlAsset[type + index] = publicPath + file
      } else if (STATIC_ASSET_RE.test(file)) {
        const [, index] = STATIC_ASSET_RE.exec(file)
        data.htmlStaticAsset[index] = publicPath + file
      }
    }
    return template(${JSON.stringify(html)}, templateSettings)(data)
  }`
    )
  } catch (error) {
    done(error)
  }
}
