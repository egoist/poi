const babel = require('@babel/core')
const namedAssetImport = require('..')

const pluginTester = ({ plugin, pluginOptions, tests }) => {
  for (const testTitle of Object.keys(tests)) {
    test(testTitle, () => {
      const { code, output } = tests[testTitle]
      expect(
        babel.transform(code, {
          plugins: [[plugin, pluginOptions]],
          babelrc: false,
          configFile: false
        }).code
      ).toBe(output)
    })
  }
}

pluginTester({
  plugin: namedAssetImport,
  pluginOptions: {
    loaderMap: {
      svg: {
        ReactComponent: '@svgr/webpack?-prettier,-svgo![path]',
        default: 'default![path]'
      }
    }
  },
  pluginName: 'named-asset-import',
  tests: {
    defaultImport: {
      code: 'import logo from "logo";',
      output: 'import logo from "logo";'
    },
    namedImport: {
      code: 'import { logo } from "logo";',
      output: 'import { logo } from "logo";'
    },
    namedImportRenamed: {
      code: 'import { Url as logo1 } from "logo";',
      output: 'import { Url as logo1 } from "logo";'
    },
    svgDefaultImport: {
      code: 'import logo from "logo.svg";',
      output: 'import logo from "default!logo.svg";'
    },
    svgNamedImport: {
      code: 'import { logo } from "logo.svg";',
      output: 'import { logo } from "logo.svg";'
    },
    svgReactComponentNamedImport: {
      code: 'import { ReactComponent as logo } from "logo.svg";',
      output: 'import logo from "@svgr/webpack?-prettier,-svgo!logo.svg";'
    },
    svgMultipleImport: {
      code:
        'import logo, { logoUrl , ReactComponent as Logo } from "logo.svg";',
      output:
        'import logo from "default!logo.svg";\n' +
        'import { logoUrl } from "logo.svg";\n' +
        'import Logo from "@svgr/webpack?-prettier,-svgo!logo.svg";'
    },
    defaultExport: {
      code: 'export default logo;',
      output: 'export default logo;'
    },
    constExport: {
      code: 'export const token = "token";',
      output: 'export const token = "token";'
    },
    classExport: {
      code: 'export class Logo {}',
      output: 'export class Logo {}'
    },
    namedExport: {
      code: 'export { logo } from "logo";',
      output: 'export { logo } from "logo";'
    },
    namedExportRenamed: {
      code: 'export { Url as logo } from "logo";',
      output: 'export { Url as logo } from "logo";'
    },
    allExport: {
      code: 'export * from "logo";',
      output: 'export * from "logo";'
    },
    svgNamedExport: {
      code: 'export { logo } from "logo.svg";',
      output: 'export { logo } from "logo.svg";'
    },
    svgAllExport: {
      code: 'export * from "logo.svg";',
      output: 'export * from "logo.svg";'
    },
    svgReactComponentNamedExport: {
      code: 'export { ReactComponent as Logo } from "logo.svg";',
      output:
        'export { default as Logo } from "@svgr/webpack?-prettier,-svgo!logo.svg";'
    },
    svgReactComponentExport: {
      code: 'export { ReactComponent } from "logo.svg";',
      output:
        'export { default as ReactComponent } from "@svgr/webpack?-prettier,-svgo!logo.svg";'
    },
    svgMultipleExport: {
      code: 'export { logoUrl , ReactComponent as Logo } from "logo.svg";',
      output:
        'export { logoUrl } from "logo.svg";\n' +
        'export { default as Logo } from "@svgr/webpack?-prettier,-svgo!logo.svg";'
    }
  }
})
