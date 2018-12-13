import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import md from 'marked'

export default () => Promise.resolve({
  value: execSync('echo 123').toString(),
  html: md(fs.readFileSync(path.join(__dirname, 'example.md'), 'utf8')),
  relativeFile: require('./abstract')
})
