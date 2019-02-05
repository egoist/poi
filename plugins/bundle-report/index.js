'use strict';

// NOTE: This is adapted version of `poi-preset-bundle-report` updated to work
//       with poi@12 (original code: https://github.com/egoist/poi/tree/v9.2.0/packages/poi-preset-bundle-report)
exports.name = 'bundle-report';

exports.cli = api => {
  if (!api.isProd) return;
  api.command.option('--bundle-report', 'View bundle report');
};

exports.apply = (api, options = {}) => {
  api.hook('createWebpackChain', config => {
    if (!api.cli.options.bundleReport) return;
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    config
      .plugin('bundle-report')
      .use(BundleAnalyzerPlugin, [options]);
  });
};
