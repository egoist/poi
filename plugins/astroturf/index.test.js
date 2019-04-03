const createProject = require('@poi/test-utils/createProject')

jest.setTimeout(300000)
test('astroturf', async () => {
  const project = await createProject({ name: 'astroturf' })
  await project.write(
    '.poirc',
    JSON.stringify({
      plugins: [require.resolve('.')],
      output: {
        format: 'cjs',
        target: 'node'
      }
    })
  )
  await project.write(
    'index.js',
    `
  import { css } from 'astroturf';

  const margin = 10;
  const height = 50;
  const bottom = height + margin;

  const styles = css\`
    .box {
      height: \${height}px;
      margin-bottom: \${margin}px;
    }

    .footer {
      position: absolute;
      top: \${bottom}px;
    }
  \`;

  export default styles;
  `
  )
  await project.run('yarn init -y')
  await project.run('yarn add sass-loader sass')
  await project.run('poi')
  expect(project.require('dist/index.js')).toEqual({
    default: {
      box: 'index-styles-module_box_1SCdY',
      footer: 'index-styles-module_footer_1xrFU'
    }
  })
})
