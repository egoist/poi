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
          '/guide/serve-public-files',
          '/guide/plugins-and-presets'
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
          },
          {
            text: 'Plugin Dev Guide',
            link: '/plugin-dev'
          }
        ]
      }
    ],
    editLinks: true,
    repo: 'upash/poi',
    docsDir: 'website/docs'
  }
}
