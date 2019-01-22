const path = require('path')

exports.name = 'eject-html'

exports.cli = api => {
  api.cli
    .command('eject-html [out-file]', 'Eject the default HTML file')
    .option('--overwrite', 'Overwrite exiting file')
    .action(async (outFile = 'public/index.html', options) => {
      const fs = require('fs-extra')
      if (
        !options.overwrite &&
        (await fs.pathExists(api.resolveCwd(outFile)))
      ) {
        return api.logger.error(
          `${outFile} already existing, try --overwrite flag if you want to update it`
        )
      }
      await fs.copy(
        path.join(__dirname, '../webpack/default-template.html'),
        api.resolveCwd(outFile)
      )
      api.logger.done(`Ejected to ${outFile}`)
    })
}
