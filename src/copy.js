/**
 * Try copying src file from `pwd` to `dist` directory. Skip on failures.
 */
const path = require('path')
const fs = require('fs')

module.exports = function(src) {
  try {
    fs.writeFileSync(path.join('dist', src), fs.readFileSync(path.join(process.cwd(), src), 'utf-8'), 'utf-8')
  } catch (e) {}
}
