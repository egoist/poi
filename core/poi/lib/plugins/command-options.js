exports.name = 'builtin:shared-options'

exports.cli = ({ command, isProd }) => {
  command.option('-d, --out-dir <dir>', 'Output directory', {
    default: 'dist'
  })

  command.option('--no-progress', 'Disable default progress bar')

  if (isProd) {
    command.option('--source-map', 'Enable source map')
  } else {
    command.option('--no-source-map', 'Disable source map')
  }

  command.option('--parallel', 'Enable multicore compilation (experimental)')

  command.option('--no-cache', 'Disable compilation caching')

  command.option('--public-url <url>', 'Set the public URL to serve on', {
    default: '/'
  })
  command.option('--public-folder <folder>', 'Use a public folder', {
    default: 'public'
  })
  command.option('--no-public-folder', 'Disable public folder')
  command.option('--target <target>', 'Target environment', {
    default: 'web'
  })
  command.option('--format <format>', 'Output format', { default: 'iife' })
  command.option('--module-name <name>', 'Module name for "umd" format')
  command.option('--file-names <filenames>', 'Customize output filenames')
  command.option('--no-clean', `Don't clean output directory before bundling`)
  command.option('--html <options>', 'Configure generated HTML file')
  command.option('--no-html', `Don't generate HTML file`)
  command.option('--no-clear-console', `Don't clear console`)

  if (isProd) {
    command.option('--no-minimize', 'Disable minimization')
  } else {
    command.option('--minimize', 'Minimize output')
  }
}
