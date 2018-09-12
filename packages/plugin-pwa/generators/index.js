const path = require('path')

exports.pwa = {
  prompts: [
    {
      name: 'lib',
      message: 'Which Service Worker library',
      type: 'list',
      choices: [
        { name: 'Offline-Plugin', value: 'offline' },
        { name: 'Workbox', value: 'workbox' }
      ],
      default: 'workbox'
    }
  ],
  invokeAfterAdd: true,
  npmInstall: true,
  generate: async ({ answers, renderTemplate, projectName, pkg, copy }) => {
    const appVersion = `^${require('../package').version}`
    pkg.dependencies = pkg.dependencies || {}
    pkg.devDependencies = pkg.devDependencies || {}
    if (answers.lib === 'offline') {
      pkg.devDependencies['@poi/plugin-offline'] = appVersion
      delete pkg.devDependencies['@poi/plugin-workbox']
    } else if (answers.lib === 'workbox') {
      pkg.devDependencies['@poi/plugin-workbox'] = appVersion
      pkg.dependencies['register-service-worker'] = '^1.0.0'
      delete pkg.devDependencies['@poi/plugin-offline']
    }

    await renderTemplate(
      path.join(__dirname, 'templates/manifest.json'),
      'public/manifest.json',
      {
        projectName
      }
    )

    await copy(path.join(__dirname, 'templates/img'), 'public/img')

    await renderTemplate(
      path.join(
        __dirname,
        `templates/register-service-worker-${answers.lib}.js`
      ),
      'src/register-service-worker.js'
    )
  }
}
