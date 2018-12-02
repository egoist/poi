exports.name = 'karma'

exports.apply = api => {
  api.hook('onCreateCLI', () => {
    api.cli
      .command('karma [...testFiles]', 'Run tests with Karma')
      .usage('karma --test [...testFiles] [options]')
      .option('-w, --watch', 'Watch files')
      .option('--no-headless', 'Run with Chrome instead of Chrome Headless')
      .action((testFiles, options) => {
        if (!options.test) {
          throw new api.PoiError({
            message: `You have to run Karma with --test flag`
          })
        }
        return require('./run-karma')(
          api,
          testFiles.length === 0 ? ['**/*.test.{js,ts}'] : testFiles,
          options
        )
      })
  })
}
