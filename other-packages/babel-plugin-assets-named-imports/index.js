const { extname } = require('path')

/**
 * @param {Object} babel
 * @param {import('@babel/types')} babel.types
 */
function namedAssetImportPlugin({ types: t }) {
  const visited = new WeakSet()

  function generateNewSourcePath(loaderMap, moduleName, sourcePath) {
    const ext = extname(sourcePath).substr(1)
    const extMap = loaderMap[ext]
    return extMap[moduleName]
      ? extMap[moduleName].replace(/\[path\]/, sourcePath)
      : sourcePath
  }

  function replaceMatchingSpecifiers(path, loaderMap, callback) {
    const sourcePath = path.node.source.value
    const ext = extname(sourcePath).substr(1)

    if (visited.has(path.node) || sourcePath.indexOf('!') !== -1) {
      return
    }

    if (loaderMap[ext]) {
      path.replaceWithMultiple(
        path.node.specifiers.map(specifier => {
          const newSpecifier = callback(specifier, sourcePath)
          visited.add(newSpecifier)

          return newSpecifier
        })
      )
    }
  }

  return {
    visitor: {
      ExportNamedDeclaration(
        path,
        {
          opts: { loaderMap }
        }
      ) {
        if (!path.node.source) {
          return
        }

        replaceMatchingSpecifiers(path, loaderMap, (specifier, sourcePath) => {
          if (t.isExportDefaultSpecifier(specifier)) {
            return t.exportDeclaration(
              [t.exportDefaultSpecifier(t.identifier(specifier.local.name))],
              t.stringLiteral(sourcePath)
            )
          }

          const newSourcePath = generateNewSourcePath(
            loaderMap,
            specifier.local.name,
            sourcePath
          )

          if (newSourcePath === sourcePath) {
            return t.exportNamedDeclaration(
              null,
              [specifier],
              t.stringLiteral(sourcePath)
            )
          }

          return t.exportNamedDeclaration(
            null,
            [
              t.exportSpecifier(
                t.identifier('default'),
                t.identifier(specifier.exported.name)
              )
            ],
            t.stringLiteral(newSourcePath)
          )
        })
      },
      ImportDeclaration(
        path,
        {
          opts: { loaderMap }
        }
      ) {
        replaceMatchingSpecifiers(path, loaderMap, (specifier, sourcePath) => {
          const isDefaultImport = t.isImportDefaultSpecifier(specifier)
          const newSoucePath = generateNewSourcePath(
            loaderMap,
            isDefaultImport ? 'default' : specifier.imported.name,
            sourcePath
          )

          if (newSoucePath === sourcePath) {
            return t.importDeclaration([specifier], t.stringLiteral(sourcePath))
          }

          return t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier(specifier.local.name))],
            t.stringLiteral(newSoucePath)
          )
        })
      }
    }
  }
}

module.exports = namedAssetImportPlugin
