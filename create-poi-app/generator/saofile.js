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
        message: 'Select the features you want (none is required)',
        type: 'checkbox',
        choices: [
          {
            name: 'Type Checker',
            value: 'typeChecker'
          },
          {
            name: 'Linter',
            value: 'linter'
          },
          {
            name: 'Unit Test',
            value: 'unit'
          },
          {
            name: 'Progressive Web App (PWA)',
            value: 'pwa'
          },
          {
            name: `Yarn Plug'n'Play `,
            value: 'pnp',
            disabled: this.npmClient !== 'yarn'
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
        name: 'linterConfig',
        message: 'Choose a linter config',
        type: 'list',
        when: ({ features }) => features.includes('linter'),
        choices({ typeChecker }) {
          return [
            typeChecker === 'ts' && {
              name: 'TSLint',
              value: 'tslint'
            },
            {
              name: 'XO',
              value: 'xo'
            }
          ].filter(Boolean)
        }
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
      },
      {
        name: 'frameworks',
        message: 'Choose a Framework (none is required)',
        type: 'checkbox',
        choices: [
          {
            name: 'React',
            value: 'react'
          }
        ]
      }
    ]
  },
  actions() {
    const {
      features,
      frameworks,
      typeChecker,
      linterConfig,
      unit
    } = this.answers
    return [
      frameworks.includes('react') && {
        type: 'add',
        templateDir: 'templates/react',
        files: '**'
      },
      !frameworks.includes('react') && {
        type: 'add',
        templateDir: 'templates/main',
        files: '**'
      },
      linterConfig && {
        type: 'add',
        templateDir: `templates/linter-${linterConfig}`,
        files: '**'
      },
      !frameworks.includes('react') && {
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
          const {
            features,
            frameworks,
            unit,
            typeChecker,
            linterConfig
          } = this.answers

          const useEslint = linterConfig && linterConfig !== 'tslint'

          return {
            name: this.outFolder,
            private: true,
            scripts: {
              build: 'poi --prod',
              dev: 'poi --serve',
              'test:unit': when(unit === 'karma', 'poi test:karma'),
              lint: when(
                useEslint,
                'eslint .',
                when(linterConfig === 'tslint', 'tslint --project .')
              )
            },
            devDependencies: {
              poi: '^12.4.2',
              '@poi/plugin-karma': when(unit === 'karma', '^13.0.0'),
              eslint: when(useEslint, '^5.9.0'),
              'eslint-config-xo': when(linterConfig === 'xo', '^0.25.0'),
              '@poi/plugin-eslint': when(useEslint, '^12.0.0'),
              typescript: when(typeChecker === 'ts', '^3.2.1'),
              '@poi/plugin-typescript': when(typeChecker === 'ts', '^12.0.1'),
              '@poi/plugin-pwa': when(features.includes('pwa'), '^12.0.2'),
              'register-service-worker': when(
                features.includes('pwa'),
                '^1.5.2'
              ),
              'react-hot-loader': when(frameworks.includes('react'), '^4.6.3')
            },
            dependencies: {
              react: when(frameworks.includes('react'), '^16.6.3'),
              'react-dom': when(frameworks.includes('react'), '^16.6.3')
            },
            installConfig: when(features.includes('pnp'), {
              pnp: true
            })
          }
        }
      },
      {
        type: 'modify',
        files: 'poi.config.js',
        handler: () => {
          const s = require('stringify-object')
          const { features, linterConfig, unit, typeChecker } = this.answers
          const config = { entry: 'src/index', plugins: [] }
          if (features.includes('pwa')) {
            config.entry = ['src/registerServiceWorker'].concat(config.entry)
          }
          if (linterConfig && linterConfig !== 'tslint') {
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
      },
      {
        type: 'move',
        patterns: {
          _gitignore: '.gitignore'
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
