module.exports = config => {
  config.module
    .rule('graphql')
    .test(/\.(graphql|gql)$/)
    .use('graphql-tag')
    .loader('graphql-tag/loader')
}
