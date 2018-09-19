module.exports = {
  title: 'Poi',
  description: 'Delightful web development.',
  themeConfig: {
    sidebar: [
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
        text: 'Guide',
        link: '/'
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
