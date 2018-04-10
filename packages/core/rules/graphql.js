module.exports = config => {
  // prettier-ignore
  config.module.rule('graphql')
    .test(/\.(gql|graphql)$/)
    .exclude
      .add(/node_modules/)
      .end()
    .use('graphql-tag')
      .loader('graphql-tag/loader')
}
