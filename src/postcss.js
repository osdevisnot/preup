/**
 * Post CSS plugins
 */
const path = require('path')
const postcssUnprefix = require('postcss-unprefix')
const postcssCopyAssets = require('postcss-copy-assets')
const postcssReplace = require('./postcss-replace')

module.exports = [
  postcssUnprefix,
  postcssCopyAssets({
    base: 'dist'
  }),
  postcssReplace
]
