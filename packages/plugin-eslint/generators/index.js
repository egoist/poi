const path = require('path')

exports.eslint = {
  // Show the generator effect in generator description
  effects: ['Add .eslintrc', 'Install relevant dependencies'],
  // Invoke this generator after running `vue add`
  invokeAfterAdd: true,
  // Run `npm install` when finished
  npmInstall: true,
  // Prompt users
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
  async generate({ answers, writeFile, pkg }) {
    pkg.scripts = pkg.scripts || {}
    pkg.dependencies = pkg.dependencies || {}
    pkg.devDependencies = pkg.devDependencies || {}

    Object.assign(pkg.scripts, {
      lint: 'poi lint'
    })

    const projectDeps = [
      ...Object.keys(pkg.dependencies),
      ...Object.keys(pkg.devDependencies)
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

    await writeFile('.eslintrc', JSON.stringify(eslint, null, 2))
    Object.assign(pkg.devDependencies, deps)
  }
}
