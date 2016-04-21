'use strict'
const Path = require('path')

const _ = module.exports = {}

_.cwd = fp => Path.join(process.cwd(), fp || '')
_.dir = fp => Path.join(__dirname, '../', fp || '')
