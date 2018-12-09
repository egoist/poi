/* eslint-env browser */
/* globals mocha puppet */
// eslint-disable-next-line import/no-unassigned-import
import 'mocha/mocha'

const div = document.createElement('div')
div.id = 'mocha'
document.body.appendChild(div)

mocha.reporter('spec')
mocha.setup(puppet.ui || 'bdd')
