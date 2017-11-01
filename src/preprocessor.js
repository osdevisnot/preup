/**
* PostCSS preprocessor
*/
const sass = require('node-sass')
const less = require('less')

module.exports = (content, id) =>
  new Promise((resolve, reject) => {
    if (id.slice(-5) === '.less') {
      less.render(content, { filename: id }).then(output => resolve({ code: output.css }))
    } else {
      resolve({ code: sass.renderSync({ file: id }).css.toString() })
    }
  })
