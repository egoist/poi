module.exports = {
  title: 'Poi',
  description: 'Delightful web development.',
  themeConfig: {
    sidebar: [
      {
        title: 'Getting Started',
        collapsable: false,
        children: [
          '/guide/introduction',
          '/guide/creating-a-project',
        ]
      },
      {
        title: 'Basics',
        collapsable: false,
        children: [
          '/guide/transforms',
          '/guide/serve-public-files'
        ]
      }
    ],
    nav: [
      {
        text: 'Learn',
        items: [
          { text: 'Guide', link: '/guide/introduction' },
          {
            text: 'Config File',
            link: '/config'
          },
          {
            text: 'Command Line',
            link: '/cli'
          }
        ]
      }
    ],
    editLinks: true,
    repo: 'egoist/poi',
    docsDir: 'docs',
    docsRepo: 'poi-bundler/website'
  }
}
