# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [12.7.5](https://github.com/egoist/poi/compare/poi@12.7.4...poi@12.7.5) (2019-12-19)

### Bug Fixes

- **deps:** [security] bump copy-webpack-plugin from 4.6.0 to 5.1.1 ([#656](https://github.com/egoist/poi/issues/656)) ([278a936](https://github.com/egoist/poi/commit/278a936))

## [12.7.4](https://github.com/egoist/poi/compare/poi@12.7.3...poi@12.7.4) (2019-12-13)

### Bug Fixes

- add regexp to allowed type of options.transpileModules ([#654](https://github.com/egoist/poi/issues/654)) ([966efff](https://github.com/egoist/poi/commit/966efff))

## [12.7.3](https://github.com/egoist/poi/compare/poi@12.7.2...poi@12.7.3) (2019-10-03)

### Bug Fixes

- fix webpack-dev-server logs ([ad7ae9a](https://github.com/egoist/poi/commit/ad7ae9a))

## [12.7.2](https://github.com/egoist/poi/compare/poi@12.7.1...poi@12.7.2) (2019-08-09)

**Note:** Version bump only for package poi

## [12.7.1](https://github.com/egoist/poi/compare/poi@12.7.0...poi@12.7.1) (2019-07-27)

### Bug Fixes

- Append `poi -s` output URLs with `output.publicUrl` ([#587](https://github.com/egoist/poi/issues/587)) ([fcd70f7](https://github.com/egoist/poi/commit/fcd70f7))

### Features

- enable https one the preview URLs ([#611](https://github.com/egoist/poi/issues/611)) ([cda0ec2](https://github.com/egoist/poi/commit/cda0ec2))

# [12.7.0](https://github.com/egoist/poi/compare/poi@12.6.10...poi@12.7.0) (2019-07-03)

### Features

- **webpack:** Upgrade mini-css-extract-webpack-plugin and support hmr ([#578](https://github.com/egoist/poi/issues/578)) ([e254e31](https://github.com/egoist/poi/commit/e254e31))
- add babel.configFile, babel.babelrc options ([#583](https://github.com/egoist/poi/issues/583)) ([57c7260](https://github.com/egoist/poi/commit/57c7260))

## [12.6.10](https://github.com/egoist/poi/compare/poi@12.6.9...poi@12.6.10) (2019-05-23)

### Bug Fixes

- stop spinner before logging ([92146e9](https://github.com/egoist/poi/commit/92146e9))

## [12.6.9](https://github.com/egoist/poi/compare/poi@12.6.8...poi@12.6.9) (2019-05-23)

**Note:** Version bump only for package poi

## [12.6.8](https://github.com/egoist/poi/compare/poi@12.6.7...poi@12.6.8) (2019-05-05)

### Bug Fixes

- **webpack:** do not override process.env.NODE_ENV, closes [#568](https://github.com/egoist/poi/issues/568) ([439af76](https://github.com/egoist/poi/commit/439af76))

## [12.6.7](https://github.com/egoist/poi/compare/poi@12.6.6...poi@12.6.7) (2019-05-03)

### Bug Fixes

- **dependency:** update css-loader ([#567](https://github.com/egoist/poi/issues/567)) ([b471032](https://github.com/egoist/poi/commit/b471032))

## [12.6.6](https://github.com/egoist/poi/compare/poi@12.6.5...poi@12.6.6) (2019-04-28)

### Bug Fixes

- ensure that ts-node returns a commonjs module, closes [#563](https://github.com/egoist/poi/issues/563) ([27eaf55](https://github.com/egoist/poi/commit/27eaf55))

## [12.6.5](https://github.com/egoist/poi/compare/poi@12.6.4...poi@12.6.5) (2019-04-16)

### Bug Fixes

- handle default export in ts config file ([62eda5a](https://github.com/egoist/poi/commit/62eda5a))

## [12.6.4](https://github.com/egoist/poi/compare/poi@12.6.3...poi@12.6.4) (2019-04-08)

**Note:** Version bump only for package poi

## [12.6.3](https://github.com/egoist/poi/compare/poi@12.6.2...poi@12.6.3) (2019-04-06)

### Bug Fixes

- scoped package name in babel.transpileModules ([1fc0217](https://github.com/egoist/poi/commit/1fc0217))

## [12.6.2](https://github.com/egoist/poi/compare/poi@12.6.1...poi@12.6.2) (2019-04-06)

**Note:** Version bump only for package poi

## [12.6.1](https://github.com/egoist/poi/compare/poi@12.6.0...poi@12.6.1) (2019-04-04)

### Features

- automatically add imports for react and preact jsx ([12dd506](https://github.com/egoist/poi/commit/12dd506))

# [12.6.0](https://github.com/egoist/poi/compare/poi@12.5.9...poi@12.6.0) (2019-04-04)

### Bug Fixes

- properly handle .mjs files, closes [#552](https://github.com/egoist/poi/issues/552) ([59ebbfe](https://github.com/egoist/poi/commit/59ebbfe))

### Features

- **cli:** add --require flag ([157c23f](https://github.com/egoist/poi/commit/157c23f))
- support loading poi.config.ts ([499ba12](https://github.com/egoist/poi/commit/499ba12))
- support preact x ([59a51f3](https://github.com/egoist/poi/commit/59a51f3))

## [12.5.9](https://github.com/egoist/poi/compare/poi@12.5.8...poi@12.5.9) (2019-03-29)

### Bug Fixes

- add #webpack-hot-client to all entries, closes [#534](https://github.com/egoist/poi/issues/534) ([2cf113b](https://github.com/egoist/poi/commit/2cf113b))

## [12.5.8](https://github.com/egoist/poi/compare/poi@12.5.7...poi@12.5.8) (2019-03-26)

### Bug Fixes

- allow to disable html generation via cli flag ([adb8d32](https://github.com/egoist/poi/commit/adb8d32))

## [12.5.7](https://github.com/egoist/poi/compare/poi@12.5.6...poi@12.5.7) (2019-03-21)

### Bug Fixes

- allow to configure css.sourceMap ([0372cd0](https://github.com/egoist/poi/commit/0372cd0))
- tweak localIdentName for css-loader ([a90a638](https://github.com/egoist/poi/commit/a90a638))

## [12.5.6](https://github.com/egoist/poi/compare/poi@12.5.5...poi@12.5.6) (2019-03-12)

**Note:** Version bump only for package poi

## [12.5.5](https://github.com/egoist/poi/compare/poi@12.5.4...poi@12.5.5) (2019-01-31)

### Bug Fixes

- include .wasm .mjs in resolve.extensions, closes [#536](https://github.com/egoist/poi/issues/536) ([79b13e7](https://github.com/egoist/poi/commit/79b13e7))

## [12.5.4](https://github.com/egoist/poi/compare/poi@12.5.3...poi@12.5.4) (2019-01-28)

### Bug Fixes

- webpack entry object syntax ([#535](https://github.com/egoist/poi/issues/535)) ([1abe601](https://github.com/egoist/poi/commit/1abe601))

## [12.5.3](https://github.com/egoist/poi/compare/poi@12.5.2...poi@12.5.3) (2019-01-28)

### Bug Fixes

- missing shortcut for setting entry in multi-page mode ([655be46](https://github.com/egoist/poi/commit/655be46))

## [12.5.2](https://github.com/egoist/poi/compare/poi@12.5.1...poi@12.5.2) (2019-01-24)

### Bug Fixes

- plugins should be resolved from config dir ([d023091](https://github.com/egoist/poi/commit/d023091))

## [12.5.1](https://github.com/egoist/poi/compare/poi@12.5.0...poi@12.5.1) (2019-01-24)

**Note:** Version bump only for package poi

# [12.5.0](https://github.com/egoist/poi/compare/poi@12.4.8...poi@12.5.0) (2019-01-24)

### Features

- support html an entry file ([289468a](https://github.com/egoist/poi/commit/289468a))

## [12.4.8](https://github.com/egoist/poi/compare/poi@12.4.7...poi@12.4.8) (2019-01-23)

### Bug Fixes

- format build time in human-readable format ([a89ecd0](https://github.com/egoist/poi/commit/a89ecd0))
- use a new port if the port is already used ([62053e5](https://github.com/egoist/poi/commit/62053e5))

## [12.4.7](https://github.com/egoist/poi/compare/poi@12.4.6...poi@12.4.7) (2019-01-23)

### Features

- validate devServer.headers option ([#532](https://github.com/egoist/poi/issues/532)) ([579b3ff](https://github.com/egoist/poi/commit/579b3ff))

## [12.4.6](https://github.com/egoist/poi/compare/poi@12.4.5...poi@12.4.6) (2019-01-22)

### Bug Fixes

- execute plugins after validating config ([ca7686d](https://github.com/egoist/poi/commit/ca7686d)), closes [#530](https://github.com/egoist/poi/issues/530)

## [12.4.5](https://github.com/egoist/poi/compare/poi@12.4.4...poi@12.4.5) (2019-01-18)

### Bug Fixes

- support babel.transpileModules on windows, closes [#527](https://github.com/egoist/poi/issues/527) ([62ecdb9](https://github.com/egoist/poi/commit/62ecdb9))

## [12.4.4](https://github.com/egoist/poi/compare/poi@12.4.3...poi@12.4.4) (2019-01-14)

### Bug Fixes

- **css:** disable tree-shaking for css files ([acc42f0](https://github.com/egoist/poi/commit/acc42f0))

## [12.4.3](https://github.com/egoist/poi/compare/poi@12.4.2...poi@12.4.3) (2019-01-11)

### Bug Fixes

- support plugin without poi-plugin prefix ([59f706e](https://github.com/egoist/poi/commit/59f706e))

## [12.4.2](https://github.com/egoist/poi/compare/poi@12.4.1...poi@12.4.2) (2019-01-09)

### Bug Fixes

- properly add pnp plugins ([fdcd9e7](https://github.com/egoist/poi/commit/fdcd9e7))

## [12.4.1](https://github.com/egoist/poi/compare/poi@12.4.0...poi@12.4.1) (2019-01-09)

### Bug Fixes

- support yarn pnp ([ca61aaa](https://github.com/egoist/poi/commit/ca61aaa))

# [12.4.0](https://github.com/egoist/poi/compare/poi@12.3.2...poi@12.4.0) (2019-01-09)

### Bug Fixes

- set test mode for test command ([2cb92c4](https://github.com/egoist/poi/commit/2cb92c4))
- tweak cli logs ([519a4fc](https://github.com/egoist/poi/commit/519a4fc))

### Features

- add a hook to invoke before running command ([fc5bcf3](https://github.com/egoist/poi/commit/fc5bcf3))
- add a shorthand to set mode for test:\* commands ([a4af8db](https://github.com/egoist/poi/commit/a4af8db))

## [12.3.2](https://github.com/egoist/poi/compare/poi@12.3.1...poi@12.3.2) (2019-01-09)

### Bug Fixes

- **serve:** read host and port from env vars ([7abfd2b](https://github.com/egoist/poi/commit/7abfd2b))

## [12.3.1](https://github.com/egoist/poi/compare/poi@12.3.0...poi@12.3.1) (2019-01-09)

### Bug Fixes

- ensure publicUrl ([5f0451f](https://github.com/egoist/poi/commit/5f0451f)), closes [#520](https://github.com/egoist/poi/issues/520)

# [12.3.0](https://github.com/egoist/poi/compare/poi@12.2.14...poi@12.3.0) (2019-01-09)

### Bug Fixes

- use pug-plain-loader for vue template ([6948539](https://github.com/egoist/poi/commit/6948539))

### Features

- show memory usage ([75f1376](https://github.com/egoist/poi/commit/75f1376))

## [12.2.14](https://github.com/egoist/poi/compare/poi@12.2.13...poi@12.2.14) (2019-01-03)

### Bug Fixes

- ignore `.DS_Store` in public folder ([#518](https://github.com/egoist/poi/issues/518)) ([91afba5](https://github.com/egoist/poi/commit/91afba5)), closes [#517](https://github.com/egoist/poi/issues/517)

## [12.2.13](https://github.com/egoist/poi/compare/poi@12.2.12...poi@12.2.13) (2019-01-02)

### Features

- allow config file to export a function ([8e82f66](https://github.com/egoist/poi/commit/8e82f66))

## [12.2.12](https://github.com/egoist/poi/compare/poi@12.2.11...poi@12.2.12) (2018-12-31)

**Note:** Version bump only for package poi

## [12.2.11](https://github.com/egoist/poi/compare/poi@12.2.10...poi@12.2.11) (2018-12-31)

### Bug Fixes

- use recommended bucklescript workflow ([2231c5c](https://github.com/egoist/poi/commit/2231c5c))

## [12.2.10](https://github.com/egoist/poi/compare/poi@12.2.9...poi@12.2.10) (2018-12-31)

### Bug Fixes

- let webpack watch all reason files ([e5c7a05](https://github.com/egoist/poi/commit/e5c7a05))

## [12.2.9](https://github.com/egoist/poi/compare/poi@12.2.8...poi@12.2.9) (2018-12-30)

### Bug Fixes

- cache support for vue templates ([aa0a430](https://github.com/egoist/poi/commit/aa0a430))

## [12.2.8](https://github.com/egoist/poi/compare/poi@12.2.7...poi@12.2.8) (2018-12-28)

### Features

- use source field from package.json as default app entry ([af61639](https://github.com/egoist/poi/commit/af61639))

## [12.2.7](https://github.com/egoist/poi/compare/poi@12.2.6...poi@12.2.7) (2018-12-25)

### Bug Fixes

- **cli:** help message ([648727e](https://github.com/egoist/poi/commit/648727e))

### Features

- add a hook to allow modifing devServer config ([df939e6](https://github.com/egoist/poi/commit/df939e6))

## [12.2.6](https://github.com/egoist/poi/compare/poi@12.2.5...poi@12.2.6) (2018-12-23)

### Bug Fixes

- **cli:** cache is enabled by default ([b2171d5](https://github.com/egoist/poi/commit/b2171d5))
- properly handle --no-config flag ([bb94787](https://github.com/egoist/poi/commit/bb94787))

## [12.2.5](https://github.com/egoist/poi/compare/poi@12.2.4...poi@12.2.5) (2018-12-22)

### Bug Fixes

- only change devtoolModuleFilenameTemplate under --serve flag ([fe5b708](https://github.com/egoist/poi/commit/fe5b708))
- resolve modules in local development ([369a352](https://github.com/egoist/poi/commit/369a352))

### Features

- add a new plugin option `when` ([17ff228](https://github.com/egoist/poi/commit/17ff228))
- support all webpack targets ([0d51120](https://github.com/egoist/poi/commit/0d51120))

## [12.2.4](https://github.com/egoist/poi/compare/poi@12.2.3...poi@12.2.4) (2018-12-21)

### Bug Fixes

- react-error-overlay doesn't work with eval source map ([ddc8213](https://github.com/egoist/poi/commit/ddc8213))
- use original file path in sourcemap in dev mode ([a2dfc5f](https://github.com/egoist/poi/commit/a2dfc5f))

## [12.2.3](https://github.com/egoist/poi/compare/poi@12.2.2...poi@12.2.3) (2018-12-21)

### Bug Fixes

- better naming for server hooks ([b9aab0b](https://github.com/egoist/poi/commit/b9aab0b))
- **cli:** only open browser on the first successful build ([13b1ac8](https://github.com/egoist/poi/commit/13b1ac8))

## [12.2.2](https://github.com/egoist/poi/compare/poi@12.2.1...poi@12.2.2) (2018-12-19)

### Bug Fixes

- use bsb-js in bs-loader ([1712516](https://github.com/egoist/poi/commit/1712516))

## [12.2.1](https://github.com/egoist/poi/compare/poi@12.2.0...poi@12.2.1) (2018-12-19)

### Bug Fixes

- vue-loader doesn't quite work with inline loaders ([7c04af6](https://github.com/egoist/poi/commit/7c04af6))

# [12.2.0](https://github.com/egoist/poi/compare/poi@12.1.6...poi@12.2.0) (2018-12-18)

### Bug Fixes

- Improve devServer config validation ([#504](https://github.com/egoist/poi/issues/504)) ([fd846b0](https://github.com/egoist/poi/commit/fd846b0))

### Features

- builtin support for ReasonML ([5dec683](https://github.com/egoist/poi/commit/5dec683))
- named imports for assets ([#505](https://github.com/egoist/poi/issues/505)) ([32f153a](https://github.com/egoist/poi/commit/32f153a))

## [12.1.6](https://github.com/egoist/poi/compare/poi@12.1.5...poi@12.1.6) (2018-12-16)

### Bug Fixes

- allow to pass a string as plugin ([81caf4a](https://github.com/egoist/poi/commit/81caf4a))

### Features

- add pug-loader ([4be8954](https://github.com/egoist/poi/commit/4be8954))
