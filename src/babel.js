/**
 * Babel Configurations for 2018
 */

const babelHelpers = require('babel-helpers')

module.exports = {
  presets: [
    [
      require.resolve('babel-preset-env'),
      {
        targets: {
          browsers: ['last 1 versions']
        },
        useBuiltIns: false,
        loose: true,
        modules: false,
        exclude: ['transform-regenerator', 'transform-es2015-typeof-symbol']
      }
    ],
    require.resolve('babel-preset-react')
  ],
  plugins: [
    require.resolve('babel-plugin-angularjs-annotate'),
    [
      require.resolve('babel-plugin-transform-object-rest-spread'),
      {
        useBuiltIns: true
      }
    ],
    require.resolve('babel-plugin-external-helpers'),
    require.resolve('babel-plugin-transform-class-properties')
  ],
  externalHelpersWhitelist: babelHelpers.list.filter(helperName => helperName !== 'asyncGenerator')
}
