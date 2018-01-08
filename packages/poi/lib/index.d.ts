import { Configuration, Stats, Options as WebpackOptions } from 'webpack'
import WebpackChain from 'webpack-chain'

declare function poi(options?: poi.Options): poi.Instance

declare namespace poi {
  interface Options {
    /** Entry point of your app. */
    entry?: string | string[] | Entry
    /** The directory to output files. */
    dist?: string
    /** Babel config */
    babel?: Babel
    /** PostCSS config */
    postcss?: PostCSS
    /** By default we only use babel-loader to transform files outside node_modules directory, but sometimes you need to transform modules which are written in ES2015 or above, then add the module names to transformModules. */
    transformModules?: string[]
    /** Specify a JSX transformer for JSX pragma. */
    jsx?: string
    /** Options for autoprefixer */
    autoprefixer?: any
    /** Enable CSS modules for all CSS files. */
    cssModules?: boolean
    /** Extract CSS into its own file. */
    extractCSS?: boolean
    /** Generate HTML file with options. */
    html?: HTML | HTML[] | boolean
    /** Inline the image (DataURL) into the bundle if it's smaller than this size (in bytes) with url-loader, otherwise file-loader is used. */
    inlineImageMaxSize?: number
    /** Set filename of generated files. */
    filename?: Filename
    /** Exclude [chunkhash] from output filename, you can use `filename` option to reach the same goal but this one is just simpler. */
    hash?: boolean
    /** Set the module name for UMD bundle. */
    moduleName?: string
    /** Copy files in this folder to the root of `dist` folder. */
    staticFolder?: string
    /** Provide options for copy-webpack-plugin */
    copy?: any
    /** Use `webpack.DefinePlugin` to replace string in source files, each value is stringified by default. */
    define?: Define
    /** Short hand for the define option to define constants under `process.env`. By default `process.env.NODE_ENV` is defined for you. */
    env?: Env
    /** Set output format. */
    format?: 'cjs' | 'umd'
    /** Toggle sourceMap or set custom webpack devtool value. */
    sourceMap?: WebpackOptions.Devtool
    /** Update webpack config. */
    webpack?: (config: Configuration) => Configuration
    /** Update webpack config with `webpack-chain`. */
    extendWebpack?: (config: WebpackChain) => void
    /** Automatically split vendor code (all imported modules in node_modules) into `vendor` chunk. */
    vendor?: boolean
    /** Minimize JS and CSS files. */
    minimize?: boolean
    /** The path to load resource from, it's useful when your site is located at a sub pach like `http://example.com/blog`, you need to set homepage to `/blog/` or `http://example.com/blog/` in this situation. */
    homepage?: string
    /**
     * Remove `dist` folder before bundling.
     * https://poi.js.org/#/options?id=removedist
     */
    removeDist?: boolean
    /**
     * Build your app as a library.
     * - `boolean`: Build in CommonJS format, output filename will default to current folder name in kebab case.
     * - `string`: Build in UMD format, and we set moduleName to its value. Output filename will default to the moduleName in kebab case.
     */
    library?: boolean | string
    /** Port for dev server. */
    port?: number
    /** Host for dev server. */
    host?: string
    /** Options for `webpack-dev-server`. */
    devServer?: any
    /** Whether to enable hot reloading. */
    hotReload?: boolean
    /** Add hot reload support to specific entries. */
    hotEntry?: string | string[]
    /** Restart Poi while the specified files are modified. */
    restartOnFileChanges?: string | string[] | boolean
    /** Options for `vue-loader` */
    vue?: any
    /** Use Runtime + Compiler build of Vue.js */
    templateCompiler?: boolean
    /**
     * Poi presets.
     *
     * Examples
     * - `presets: './local-preset'`
     * - `presets: ['react']`
     * - `presets: [require('poi-preset-react')(options)]`
     */
    presets?: string | any[]
    /** Running mode */
    mode?: 'development' | 'production' | 'test' | 'watch'
  }

  interface Entry {
    [name: string]: string | string[]
  }

  interface Babel {
    [key: string]: any
  }

  interface PostCSS {
    [key: string]: any
  }

  interface HTML {
    /** Value for `<title>` tag. */
    title?: string,
    /** Value for `<meta>` description. */
    description?: string,
    /** Path to template file. */
    template?: string,
    [key: string]: any
  }

  interface Filename {
    js?: string,
    css?: string,
    fonts?: string,
    images?: string,
    chunk?: string
  }

  interface Define {
    [key: string]: any
  }

  interface Env {
    [key: string]: any
  }

  interface Instance {
    options: Options
    createWebpackConfig: () => Configuration
    prepare: () => Promise<any>
    build: () => Promise<Stats>
    dev: () => PoiServer
  }

  interface PoiServer {
    server: any
    host: string
    port: number
  }
}

export = poi
