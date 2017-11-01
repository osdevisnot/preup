/**
 * Utility to get last commit from working directory
 */
const sync = require('child_process').execSync
module.exports = function() {
  return sync('git log -n 1')
    .toString()
    .trim()
    .split('\n')
    .filter(val => val)
    .map(val => val.trim())
    .join('$$')
}
