module.exports = {
  title: 'Poi',
  description: 'Delightful web development.',
  themeConfig: {
    sidebar: [
      {
        title: 'Guide',
        collapsable: false,
        children: [
          '/guide/getting-started',
          '/guide/transforms',
          '/guide/serve-public-files',
          '/guide/plugins-and-presets'
        ]
      }
    ],
    nav: [
      {
        text: 'Guide',
        link: '/guide/getting-started'
      },
      {
        text: 'Config File',
        link: '/config'
      },
      {
        text: 'Plugin Dev Guide',
        link: '/plugin-dev'
      }
    ],
    editLinks: true,
    repo: 'leptosia/poi',
    docsDir: 'website/docs'
  }
}
