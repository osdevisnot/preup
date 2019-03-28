/**
 * Babel Configurations for 2019
 */

module.exports = {
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          browsers: ['last 1 versions']
        },
        useBuiltIns: false,
        loose: true
      }
    ],
    require.resolve('@babel/preset-react')
  ],
  plugins: [
    require.resolve('babel-plugin-angularjs-annotate'),
    [
      require.resolve('@babel/plugin-proposal-object-rest-spread'),
      {
        useBuiltIns: true
      }
    ],
    require.resolve('@babel/plugin-proposal-class-properties')
  ]
}
