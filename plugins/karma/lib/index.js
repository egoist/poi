exports.name = 'karma'

exports.apply = api => {
  api.hook('createCLI', () => {
    api.cli
      .command('karma [...testFiles]', 'Run unit tests with Karma')
      .usage('karma --test [...testFiles] [options]')
      .option('-w, --watch', 'Watch files')
      .option('--no-headless', 'Run with Chrome instead of Chrome Headless')
      .option('--coverage', 'Report code coverage')
      .action((testFiles, options) => {
        api.hook('createWebpackConfig', config => {
          if (options.coverage) {
            /* for general usage */
            const istanbulinstrumenterRule = config.module
              .rule('istanbul-instrumenter')
              .test(/\.(jsx?)$/)
              .exclude.add(/(node_modules|\.test\.jsx?)/)
              .end()
              .enforce('pre')
            istanbulinstrumenterRule
              .use('istanbul-instrumenter-loader')
              .loader('istanbul-instrumenter-loader')
              .options({
                esModules: true
              })
          }
        })

        return require('./run-karma')(
          api,
          testFiles.length === 0 ? ['**/*.{test,spec}.{js,ts}'] : testFiles,
          options
        )
      })
  })
}
