const path = require('path')

const when = (condition, value, fallback) => (condition ? value : fallback)

module.exports = {
  prepare() {
    if (this.outDir === process.cwd()) {
      throw this.createError(
        `You can't create a new project in current directory`
      )
    }
  },
  prompts() {
    return [
      {
        name: 'features',
        message: 'Select the features you want',
        type: 'checkbox',
        choices: [
          {
            name: 'Type Checker',
            value: 'typeChecker'
          },
          {
            name: 'ESLint',
            value: 'eslint'
          },
          {
            name: 'Unit Test',
            value: 'unit'
          },
          {
            name: 'Progressive Web App (PWA)',
            value: 'pwa'
          }
        ]
      },
      {
        name: 'typeChecker',
        message: 'Choose a Type Checker',
        type: 'list',
        when: ({ features }) => features.includes('typeChecker'),
        choices: [
          {
            name: 'TypeScript',
            value: 'ts'
          },
          {
            name: 'Flow (TODO)',
            value: 'flow',
            disabled: true
          }
        ]
      },
      {
        name: 'eslint',
        message: 'Choose an ESLint config',
        type: 'list',
        when: ({ features, typeChecker }) =>
          features.includes('eslint') && typeChecker !== 'ts',
        choices: [
          {
            name: 'XO',
            value: 'xo'
          }
        ]
      },
      {
        name: 'unit',
        message: 'Choose a Unit Test tool',
        type: 'list',
        when: ({ features }) => features.includes('unit'),
        choices: [
          {
            name: 'Karma',
            value: 'karma'
          }
        ]
      }
    ]
  },
  actions() {
    const { features, typeChecker, eslint, unit } = this.answers
    return [
      {
        type: 'add',
        templateDir: 'templates/main',
        files: '**'
      },
      eslint && {
        type: 'add',
        templateDir: 'templates/eslint',
        files: '**'
      },
      {
        type: 'add',
        templateDir: `templates/${typeChecker === 'ts' ? 'ts' : 'js'}`,
        files: '**',
        filters: {
          '**/*.test.{js,ts}': Boolean(unit)
        }
      },
      features.includes('pwa') && {
        type: 'add',
        templateDir: 'templates/pwa',
        files: '**'
      },
      {
        type: 'modify',
        files: 'package.json',
        handler: () => {
          const { features, unit, typeChecker, eslint } = this.answers

          return {
            name: this.outFolder,
            private: true,
            scripts: {
              build: 'poi --prod',
              dev: 'poi --serve',
              'test:unit': when(unit === 'karma', 'poi karma --test')
            },
            devDependencies: {
              poi: 'next',
              '@poi/plugin-karma': when(unit === 'karma', 'next'),
              eslint: when(eslint, '^4.0.0'),
              'eslint-config-xo': when(eslint === 'xo', '^0.23.0'),
              '@poi/plugin-eslint': when(eslint, 'next'),
              typescript: when(typeChecker === 'ts', '^3.2.1'),
              '@poi/plugin-typescript': when(typeChecker === 'ts', 'next'),
              '@poi/plugin-pwa': when(features.includes('pwa'), 'next')
            }
          }
        }
      },
      {
        type: 'modify',
        files: 'poi.config.js',
        handler: () => {
          const s = require('stringify-object')
          const { features, eslint, unit, typeChecker } = this.answers
          const config = { entry: 'src/index', plugins: [] }
          if (eslint) {
            config.plugins.push({
              resolve: '@poi/plugin-eslint'
            })
          }
          if (unit === 'karma') {
            config.plugins.push({
              resolve: '@poi/plugin-karma'
            })
          }
          if (typeChecker === 'ts') {
            config.plugins.push({
              resolve: '@poi/plugin-typescript'
            })
          }
          if (features.includes('pwa')) {
            config.plugins.push({
              resolve: '@poi/plugin-pwa'
            })
          }
          return `module.exports = ${s(config, {
            singleQuotes: true,
            indent: '  '
          })}`
        }
      }
    ].filter(Boolean)
  },
  async completed() {
    this.gitInit()
    await this.npmInstall()
    this.showProjectTips()

    const logCd = () => {
      if (this.outDir !== process.cwd()) {
        console.log(
          `${this.chalk.bold('cd')} ${this.chalk.cyan(
            path.relative(process.cwd(), this.outDir)
          )}`
        )
      }
    }

    this.logger.tip(`To start dev server, run following commands:`)
    logCd()
    console.log(
      `${this.chalk.bold(this.npmClient)} ${this.chalk.cyan('run dev')}`
    )

    this.logger.tip(`To build for production, run following commands:`)
    logCd()
    console.log(
      `${this.chalk.bold(this.npmClient)} ${this.chalk.cyan('run build')}`
    )
  }
}
