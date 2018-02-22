var postcss = require('postcss')
var parser = require('postcss-value-parser')

module.exports = postcss.plugin('postcss-replace', () => {
  return function(css) {
    css.walkDecls(function(decl) {
      var root = parser(decl.value)

      root.nodes = root.nodes.map(function(node) {
        const value = node.value
        if (node.type === 'function' && node.value === 'url') {
          node.nodes.map(function(unode) {
            unode.value = unode.value.replace('../../dist/', '')
            unode.value = unode.value.replace('../', '')
            unode.value = unode.value.replace('../', '')
          })
        }
        return node
      })
      decl.value = root.toString()
    })
  }
})
