## [Version 6.22.1](https://github.com/egoist/vbuild/releases/tag/v6.22.1) (2017-3-3)

### Bug fixes

- improve cli output: [`1bd2cf1`](https://github.com/egoist/vbuild/commit/1bd2cf1)

[...full changes](https://github.com/egoist/vbuild/compare/v6.22.0...v6.22.1)

## [Version 6.22.0](https://github.com/egoist/vbuild/releases/tag/v6.22.0) (2017-3-3)

### New features

- use @ to resolve src folder: [`d804dd1`](https://github.com/egoist/vbuild/commit/d804dd1)
- add option to include template compiler: [`18917d7`](https://github.com/egoist/vbuild/commit/18917d7)

[...full changes](https://github.com/egoist/vbuild/compare/v6.21.0...v6.22.0)

## [Version 6.21.0](https://github.com/egoist/vbuild/releases/tag/v6.21.0) (2017-3-2)

### New features

- only load config in cli: [`7fc480d`](https://github.com/egoist/vbuild/commit/7fc480d)
- add option to generate webpack stats: [`32963f8`](https://github.com/egoist/vbuild/commit/32963f8)
- move logs to cli: [`4c2c129`](https://github.com/egoist/vbuild/commit/4c2c129)

[...full changes](https://github.com/egoist/vbuild/compare/v6.20.1...v6.21.0)

## [Version 6.20.1](https://github.com/egoist/vbuild/releases/tag/v6.20.1) (2017-2-27)

### Bug fixes

- remove undefined cli options: [`12e951d`](https://github.com/egoist/vbuild/commit/12e951d)

[...full changes](https://github.com/egoist/vbuild/compare/v6.20.0...v6.20.1)

## [Version 6.20.0](https://github.com/egoist/vbuild/releases/tag/v6.20.0) (2017-2-27)

### New features

- refactor cli: [`9848fb4`](https://github.com/egoist/vbuild/commit/9848fb4)

### Bug fixes

- no need to clean dist if format is set: [`cc17be3`](https://github.com/egoist/vbuild/commit/cc17be3)

[...full changes](https://github.com/egoist/vbuild/compare/v6.19.1...v6.20.0)

## [Version 6.19.1](https://github.com/egoist/vbuild/releases/tag/v6.19.1) (2017-2-26)

### Bug fixes

- read homepage from package.json and disable it in dev mode: [`4c38fb1`](https://github.com/egoist/vbuild/commit/4c38fb1)

[...full changes](https://github.com/egoist/vbuild/compare/v6.19.0...v6.19.1)

## [Version 6.19.0](https://github.com/egoist/vbuild/releases/tag/v6.19.0) (2017-2-26)

### New features

- support using `main` field in package.json as entry: [`1a01145`](https://github.com/egoist/vbuild/commit/1a01145)
- update deps: [`0caf499`](https://github.com/egoist/vbuild/commit/0caf499)

### Bug fixes

- allow to disable config file: [`ae95907`](https://github.com/egoist/vbuild/commit/ae95907)

[...full changes](https://github.com/egoist/vbuild/compare/v6.18.1...v6.19.0)

## [Version 6.18.1](https://github.com/egoist/vbuild/releases/tag/v6.18.1) (2017-2-25)

### Bug fixes

- simplify template config: [`b5be623`](https://github.com/egoist/vbuild/commit/b5be623)

[...full changes](https://github.com/egoist/vbuild/compare/v6.18.0...v6.18.1)

## [Version 6.18.0](https://github.com/egoist/vbuild/releases/tag/v6.18.0) (2017-2-25)

### New features

- use cosmiconfig: [`c2e85da`](https://github.com/egoist/vbuild/commit/c2e85da)
- infer html title and template, description. closed [#130](https://github.com/egoist/vbuild/issues/130): [`639c37f`](https://github.com/egoist/vbuild/commit/639c37f)

### Bug fixes

- only throw when user explictly sets config file: [`78f3459`](https://github.com/egoist/vbuild/commit/78f3459)
- check config file: [`af0fdc3`](https://github.com/egoist/vbuild/commit/af0fdc3)
- adjust template filename: [`48599df`](https://github.com/egoist/vbuild/commit/48599df)

[...full changes](https://github.com/egoist/vbuild/compare/v6.17.1...v6.18.0)

## [Version 6.17.1](https://github.com/egoist/vbuild/releases/tag/v6.17.1) (2017-2-23)

### Bug fixes

- do not throw when no config specified: [`f50fd92`](https://github.com/egoist/vbuild/commit/f50fd92)

[...full changes](https://github.com/egoist/vbuild/compare/v6.17.0...v6.17.1)

## [Version 6.17.0](https://github.com/egoist/vbuild/releases/tag/v6.17.0) (2017-2-23)

### New features

- promisify api: [`8a83327`](https://github.com/egoist/vbuild/commit/8a83327)

### Bug fixes

- load babel/postcss config file by default: [`cb04cc2`](https://github.com/egoist/vbuild/commit/cb04cc2)
- tweaks: [`578ac48`](https://github.com/egoist/vbuild/commit/578ac48)
- load vbuild.config.js if it exists: [`891fdcb`](https://github.com/egoist/vbuild/commit/891fdcb)

[...full changes](https://github.com/egoist/vbuild/compare/v6.16.4...v6.17.0)

## [Version 6.16.4](https://github.com/egoist/vbuild/releases/tag/v6.16.4) (2017-2-22)

### Bug fixes

- add option to disable `cleanDist`: [`9997aa5`](https://github.com/egoist/vbuild/commit/9997aa5)

[...full changes](https://github.com/egoist/vbuild/compare/v6.16.3...v6.16.4)

## [Version 6.16.3](https://github.com/egoist/vbuild/releases/tag/v6.16.3) (2017-2-22)

### Bug fixes

- add notifier when failing to start: [`27d2ce4`](https://github.com/egoist/vbuild/commit/27d2ce4)

[...full changes](https://github.com/egoist/vbuild/compare/v6.16.2...v6.16.3)

## [Version 6.16.2](https://github.com/egoist/vbuild/releases/tag/v6.16.2) (2017-2-22)

### Bug fixes

- remove interpolate-html-plugin, passing variable directly by html-webpack-plugin: [`08c709b`](https://github.com/egoist/vbuild/commit/08c709b)

[...full changes](https://github.com/egoist/vbuild/compare/v6.16.1...v6.16.2)

## [Version 6.16.1](https://github.com/egoist/vbuild/releases/tag/v6.16.1) (2017-2-21)

### Bug fixes

- optimize error class: [`df5c8d8`](https://github.com/egoist/vbuild/commit/df5c8d8)
- ensure static folder exists: [`16d8bf5`](https://github.com/egoist/vbuild/commit/16d8bf5)

[...full changes](https://github.com/egoist/vbuild/compare/v6.16.0...v6.16.1)

## [Version 6.16.0](https://github.com/egoist/vbuild/releases/tag/v6.16.0) (2017-2-21)

### New features

- use cli prompts to retrive data: [`afba944`](https://github.com/egoist/vbuild/commit/afba944)
- add `--component` option for: [`880370a`](https://github.com/egoist/vbuild/commit/880370a)

### Bug fixes

- request moduleName if it's not an electron app: [`d2dd5a6`](https://github.com/egoist/vbuild/commit/d2dd5a6)
- tweak cli prompts: [`ea2a893`](https://github.com/egoist/vbuild/commit/ea2a893)

[...full changes](https://github.com/egoist/vbuild/compare/v6.15.0...v6.16.0)

## [Version 6.15.0](https://github.com/egoist/vbuild/releases/tag/v6.15.0) (2017-2-21)

### New features

- add `transpileModules` option: [`38f3cc5`](https://github.com/egoist/vbuild/commit/38f3cc5)

### Bug fixes

- update deps: [`046437e`](https://github.com/egoist/vbuild/commit/046437e)

[...full changes](https://github.com/egoist/vbuild/compare/v6.14.3...v6.15.0)

## [Version 6.14.3](https://github.com/egoist/vbuild/releases/tag/v6.14.3) (2017-2-20)

### Bug fixes

- add readme for template: [`b1a19bd`](https://github.com/egoist/vbuild/commit/b1a19bd)

[...full changes](https://github.com/egoist/vbuild/compare/v6.14.2...v6.14.3)

## [Version 6.14.2](https://github.com/egoist/vbuild/releases/tag/v6.14.2) (2017-2-20)

### Bug fixes

- check if it's running in dev mode: [`0fad783`](https://github.com/egoist/vbuild/commit/0fad783)

[...full changes](https://github.com/egoist/vbuild/compare/v6.14.1...v6.14.2)

## [Version 6.14.1](https://github.com/egoist/vbuild/releases/tag/v6.14.1) (2017-2-20)

### Bug fixes

- use chokidar instead of fs.watch: [`ddd44bb`](https://github.com/egoist/vbuild/commit/ddd44bb)
- close devmiddleware before restarting: [`bbfbc0f`](https://github.com/egoist/vbuild/commit/bbfbc0f)
- better error handling when port is in use: [`0806a58`](https://github.com/egoist/vbuild/commit/0806a58)

[...full changes](https://github.com/egoist/vbuild/compare/v6.14.0...v6.14.1)

## [Version 6.14.0](https://github.com/egoist/vbuild/releases/tag/v6.14.0) (2017-2-20)

### New features

- Expose devMiddleware in API: [`682c6a5`](https://github.com/egoist/vbuild/commit/682c6a5)

### Bug fixes

- do not listen on port when using as module: [`da3bc4f`](https://github.com/egoist/vbuild/commit/da3bc4f)
- apply custom setup before connect-history-api-fallback: [`9640428`](https://github.com/egoist/vbuild/commit/9640428)

[...full changes](https://github.com/egoist/vbuild/compare/v6.13.0...v6.14.0)

## [Version 6.13.0](https://github.com/egoist/vbuild/releases/tag/v6.13.0) (2017-2-19)

### New features

- allow user to configure css extraction: [`7a68b61`](https://github.com/egoist/vbuild/commit/7a68b61)

[...full changes](https://github.com/egoist/vbuild/compare/v6.12.1...v6.13.0)

## [Version 6.12.1](https://github.com/egoist/vbuild/releases/tag/v6.12.1) (2017-2-18)

### Bug fixes

- exclude some module that might come from vbuild: [`66a5715`](https://github.com/egoist/vbuild/commit/66a5715)
- fix hmrEntry: [`73accf3`](https://github.com/egoist/vbuild/commit/73accf3)

[...full changes](https://github.com/egoist/vbuild/compare/v6.12.0...v6.12.1)

## [Version 6.12.0](https://github.com/egoist/vbuild/releases/tag/v6.12.0) (2017-2-18)

### New features

- Support umd and cjs format: [`52a2992`](https://github.com/egoist/vbuild/commit/52a2992)

### Bug fixes

- support json extension: [`cf1b9b7`](https://github.com/egoist/vbuild/commit/cf1b9b7)

[...full changes](https://github.com/egoist/vbuild/compare/v6.11.0...v6.12.0)

## [Version 6.11.0](https://github.com/egoist/vbuild/releases/tag/v6.11.0) (2017-2-17)

### New features

- add `homepage option`: [`d12c3e6`](https://github.com/egoist/vbuild/commit/d12c3e6)

### Bug fixes

- update template: [`b416b10`](https://github.com/egoist/vbuild/commit/b416b10)

[...full changes](https://github.com/egoist/vbuild/compare/v6.10.3...v6.11.0)

## [Version 6.10.3](https://github.com/egoist/vbuild/releases/tag/v6.10.3) (2017-2-17)

### Bug fixes

- split css and es6 files: [`deacca1`](https://github.com/egoist/vbuild/commit/deacca1)

[...full changes](https://github.com/egoist/vbuild/compare/v6.10.2...v6.10.3)

## [Version 6.10.2](https://github.com/egoist/vbuild/releases/tag/v6.10.2) (2017-2-17)

### Bug fixes

- Tweak css loader syntax for webpack 2: [`cd15f07`](https://github.com/egoist/vbuild/commit/cd15f07)

[...full changes](https://github.com/egoist/vbuild/compare/v6.10.1...v6.10.2)

## [Version 6.10.1](https://github.com/egoist/vbuild/releases/tag/v6.10.1) (2017-2-17)

### Bug fixes

- don't quit when failed in watch mode: [`b87e8d9`](https://github.com/egoist/vbuild/commit/b87e8d9)

[...full changes](https://github.com/egoist/vbuild/compare/v6.10.0...v6.10.1)

## [Version 6.10.0](https://github.com/egoist/vbuild/releases/tag/v6.10.0) (2017-2-17)

### New features

- Expose JavaScript API: [`171ef12`](https://github.com/egoist/vbuild/commit/171ef12)

### Bug fixes

- output info cause it might output error log: [`efb9fca`](https://github.com/egoist/vbuild/commit/efb9fca)

[...full changes](https://github.com/egoist/vbuild/compare/v6.9.2...v6.10.0)

## [Version 6.9.2](https://github.com/egoist/vbuild/releases/tag/v6.9.2) (2017-2-17)

### Bug fixes

- force reload when hmr failed: [`2c10592`](https://github.com/egoist/vbuild/commit/2c10592)
- fix template: [`7672ab0`](https://github.com/egoist/vbuild/commit/7672ab0)

[...full changes](https://github.com/egoist/vbuild/compare/v6.9.1...v6.9.2)

## [Version 6.9.1](https://github.com/egoist/vbuild/releases/tag/v6.9.1) (2017-2-16)

### Bug fixes

- add more log: [`5c1660f`](https://github.com/egoist/vbuild/commit/5c1660f)

[...full changes](https://github.com/egoist/vbuild/compare/v6.9.0...v6.9.1)

## [Version 6.9.0](https://github.com/egoist/vbuild/releases/tag/v6.9.0) (2017-2-16)

### New features

- add `define`: [`7aa28d2`](https://github.com/egoist/vbuild/commit/7aa28d2)
- load env variables: [`0ee6a4b`](https://github.com/egoist/vbuild/commit/0ee6a4b)

### Bug fixes

- stringify env variables: [`31e218d`](https://github.com/egoist/vbuild/commit/31e218d)
- fix lint: [`150598a`](https://github.com/egoist/vbuild/commit/150598a)
- update deps: [`fdb61f6`](https://github.com/egoist/vbuild/commit/fdb61f6)

[...full changes](https://github.com/egoist/vbuild/compare/v6.8.0...v6.9.0)

## [Version 6.8.0](https://github.com/egoist/vbuild/releases/tag/v6.8.0) (2017-2-16)

### New features

- merge postcss plugins: [`7411150`](https://github.com/egoist/vbuild/commit/7411150)

### Bug fixes

- tweak for webpack 2: [`034e8dd`](https://github.com/egoist/vbuild/commit/034e8dd)

[...full changes](https://github.com/egoist/vbuild/compare/v6.7.0...v6.8.0)

## [Version 6.7.0](https://github.com/egoist/vbuild/releases/tag/v6.7.0) (2017-2-15)

### New features

- add built-in eslint support: [`22e56a2`](https://github.com/egoist/vbuild/commit/22e56a2)

### Bug fixes

- make eslint work for all modes: [`369b8c5`](https://github.com/egoist/vbuild/commit/369b8c5)

[...full changes](https://github.com/egoist/vbuild/compare/v6.6.0...v6.7.0)

## [Version 6.6.0](https://github.com/egoist/vbuild/releases/tag/v6.6.0) (2017-2-15)

### New features

- add config shorthand: [`2dbb0a6`](https://github.com/egoist/vbuild/commit/2dbb0a6)

### Bug fixes

- hide commands in subcommands: [`8f33026`](https://github.com/egoist/vbuild/commit/8f33026)
- tweaks: [`0261958`](https://github.com/egoist/vbuild/commit/0261958)

[...full changes](https://github.com/egoist/vbuild/compare/v6.5.1...v6.6.0)

## [Version 6.5.1](https://github.com/egoist/vbuild/releases/tag/v6.5.1) (2017-2-15)

### Bug fixes

- adjust log for electron app: [`b1582f7`](https://github.com/egoist/vbuild/commit/b1582f7)

[...full changes](https://github.com/egoist/vbuild/compare/v6.5.0...v6.5.1)

## [Version 6.5.0](https://github.com/egoist/vbuild/releases/tag/v6.5.0) (2017-2-15)

### New features

- improve template, add default favicon: [`9bd2559`](https://github.com/egoist/vbuild/commit/9bd2559)
- add electron template: [`d0e00a4`](https://github.com/egoist/vbuild/commit/d0e00a4)
- add vue-devtools in electron app: [`592c1b0`](https://github.com/egoist/vbuild/commit/592c1b0)

### Bug fixes

- only check default entry: [`d76930e`](https://github.com/egoist/vbuild/commit/d76930e)

[...full changes](https://github.com/egoist/vbuild/compare/v6.4.2...v6.5.0)

## [Version 6.4.2](https://github.com/egoist/vbuild/releases/tag/v6.4.2) (2017-2-15)

### Bug fixes

- use publicPath from webpack config: [`89a449b`](https://github.com/egoist/vbuild/commit/89a449b)

[...full changes](https://github.com/egoist/vbuild/compare/v6.4.1...v6.4.2)


---

Generated by [changelog.md](https://github.com/egoist/changelog.md)
