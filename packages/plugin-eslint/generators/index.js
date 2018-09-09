const path = require('path')

exports.eslint = {
  effects: ['Add .eslintrc', 'Install relevant dependencies'],
  invokeOnAdd: true,
  prompts: [
    {
      name: 'config',
      type: 'list',
      message: 'Choose the preferred ESLint config',
      choices: [
        {
          name: 'ESLint with error prevention only',
          value: 'minimal'
        },
        {
          name: 'ESLint with Standard config',
          value: 'standard'
        }
      ],
      default: 'minimal'
    }
  ],
  async generate({ answers, writeFile, pkg, updatePkg, npmInstall }) {
    const projectDeps = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {})
    ]

    const framework = projectDeps.includes('vue')
      ? 'vue'
      : projectDeps.includes('react')
        ? 'react'
        : 'vanilla'

    const { eslint, deps } = require(path.join(
      __dirname,
      'data',
      `${framework}-${answers.config}.js`
    ))

    const wrote = await writeFile('.eslintrc', JSON.stringify(eslint, null, 2))

    if (wrote) {
      await updatePkg(pkg => {
        pkg.scripts = Object.assign({}, pkg.scripts, {
          lint: 'poi lint'
        })
        pkg.devDependencies = Object.assign({}, pkg.devDependencies, deps)
      })
      await npmInstall()
    }
  }
}
