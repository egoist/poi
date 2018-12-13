import path from 'path'
import { execSync } from 'child_process'

export default () => Promise.resolve({
  value: execSync('echo 123').toString()
})
