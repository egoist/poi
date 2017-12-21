 /* eslint-disable */

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict'

const launchEditor = require('./launch-editor')
const launchEditorEndpoint = require('./launch-editor-endpoint')

module.exports = function createLaunchEditorMiddleware() {
  return function launchEditorMiddleware(req, res, next) {
    if (req.url.startsWith(launchEditorEndpoint)) {
      launchEditor(req.query.fileName, req.query.lineNumber)
      res.end()
    } else {
      next()
    }
  }
}
