// Horay! you can use the alias `fuckbuild` instead of `vbuild`
// We just publish `vbuild` as `fuckbuild` as well!
// Should only run this after publishing a new version of `vbuild`
const spawn = require('cross-spawn')
const Pkg = require('update-pkg')

const pkg = new Pkg()
pkg.set('name', 'fuckbuild')
pkg.saveSync()
spawn.sync('npm', ['publish'], {stdio: 'inherit'})
pkg.set('name', 'vbuild')
pkg.saveSync()
