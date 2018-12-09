/* globals puppet mocha */
mocha.checkLeaks()
mocha.run(failures => {
  puppet.exit(failures > 0 ? 1 : 0)
})
