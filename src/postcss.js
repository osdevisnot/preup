/**
 * Post CSS plugins
 */
const postcssUnprefix = require('postcss-unprefix')
const postcssCopyAssets = require('postcss-copy-assets')

module.exports = [
  postcssUnprefix,
  postcssCopyAssets({
    base: 'dist',
    pathTransform: path => {
      return 'dist/' + path.substr(path.lastIndexOf('/') + 1)
    }
  })
]
