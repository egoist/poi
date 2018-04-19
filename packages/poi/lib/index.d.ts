interface BabelOpts {
  jsx?: string
  include?: string[]
}

interface CSSOpts {
  /**
   * Extract CSS into a single file
   */
  extract?: boolean
  /**
   * Enable CSS modules for all CSS files
   */
  modules?: boolean
}

interface FilenameOpts {
  js?: string
  css?: string
  chunk?: string
  image?: string
  font?: string
}

interface VueOpts {
  /**
   * Use runtime+compiler build for Vue.js
   */
  fullBuild?: boolean

  /**
   * Options for vue-loader
   */
  loaderOptions?: {
    [k: string]: any
  }
}

interface HTMLOpts {
  /**
   * Custom HTML title
   */
  title?: string
  /**
   * Custom meta description tag
   */
  description?: string
  [k: string]: any
}

interface PoiOptions {
  /**
   * The entry file of your app.
   */
  entry?: string | string[] | {[k: string]: string[]}

  /**
   * The output directory of bundled files.
   */
  outDir?: string

  /**
   * Clean output directory before bundling
   */
  cleanOutDir?: boolean

  /**
   * This option specifies the public URL of the output directory when referenced in a browser.
   */
  publicPath?:string

  /**
   * Bundle format
   */
  format?: string

  /**
   * Customize babel behavior
   */
  babel?: BabelOpts

  css?: CSSOpts

  /**
   * Specify the module name of bundled umd library
   */
  moduleName?: string

  /**
   * Whether to load local .env file
   */
  env?: boolean

  /**
   * Define global constants which can be configured at compile time.
   */
  define?: {
    [k: string]: any
  }

  /**
   * Options for html-webpack-plugin
   */
  html?: HTMLOpts | HTMLOpts[]

  /**
   * Toggle source map or use custom source map type
   */
  sourceMap?: string | boolean

  /**
   * Minimize bundled code.
   */
  minimize?: boolean

  /**
   * Customize output filenames
   */
  filename?: FilenameOpts

  /**
   * Customize vue
   */
  vue?: VueOpts

  /**
   * Options for webpack-dev-servr
   */
  devServer?: any

  /**
   * Port for dev server
   */
  port?: number

  /**
   * Host for dev server
   */
  host?: string

  /**
   * Toggle hot reloading
   */
  hotReload?: boolean

  /**
   * Make certain entries hotreload-able
   */
  hotEntry?: string | string[]

  /**
   * Restart the Poi process when specific files are modified.
   */
  restartOnFileChanges?: string | string[]

  /**
   * Toggle hash in output filenames
   */
  hash?: boolean

  /**
   * Use Poi plugins
   */
  plugins?: any // TODO: type this

  /**
   * Whatever else
   */
  [k: string]: any
}

type Options = PoiOptions | ((opts: PoiOptions) => PoiOptions)

export {
  Options
}
