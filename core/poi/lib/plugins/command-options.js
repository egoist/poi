exports.name = 'builtin:shared-options'

exports.apply = api => {
  api.hook('onCreateCLI', ({ command }) => {
    command.option('-d, --out-dir <dir>', 'Output directory', {
      default: 'dist'
    })

    command.option('--no-progress', 'Disable default progress bar')

    if (api.isProd) {
      command.option('--source-map', 'Enable source map')
    } else {
      command.option('--no-source-map', 'Disable source map')
    }

    command.option('--parallel', 'Enable multicore compilation (experimental)')

    command.option('--cache', 'Enable compilation caching')

    command.option('--public-url <url>', 'Set the public URL to serve on', {
      default: '/'
    })
    command.option('--target <target>', 'Target environment', {
      default: 'browser'
    })
    command.option('--format <format>', 'Output format', { default: 'iife' })
    command.option('--module-name <name>', 'Module name for "umd" format')
    command.option('--file-names <filenames>', 'Customize output filenames')
    command.option('--no-clean', `Don't clean output directory before bundling`)
    command.option('--html <options>', 'Configure generated HTML file')

    if (api.isProd) {
      command.option('--no-minimize', 'Disable minimization')
    } else {
      command.option('--minimize', 'Minimize output')
    }
  })
}
