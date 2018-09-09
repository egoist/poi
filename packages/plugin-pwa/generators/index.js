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
  generate: async ({
    answers,
    renderTemplate,
    projectName,
    npmInstall,
    updatePkg
  }) => {
    const wrote = await renderTemplate(
      path.join(__dirname, 'templates/manifest.json'),
      'public/manifest.json',
      {
        projectName
      }
    )
    if (wrote) {
      await updatePkg(pkg => {
        pkg.dependencies = pkg.dependencies || {}
        pkg.devDependencies = pkg.devDependencies || {}
        if (answers.lib === 'offline') {
          pkg.devDependencies['@poi/plugin-offline'] = 'next'
        } else if (answers.lib === 'workbox') {
          pkg.devDependencies['@poi/plugin-workbox'] = 'next'
          pkg.dependencies['register-service-worker'] = '^1.0.0'
        }
      })
      await renderTemplate(
        path.join(
          __dirname,
          `templates/register-service-worker-${answers.lib}.js`
        ),
        'src/register-service-worker.js'
      )
      await npmInstall()
    }
  },
  invokeOnAdd: true
}
