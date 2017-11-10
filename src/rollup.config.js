const path = require('path')
/**
 * Rollup Plugins
 */
const $ = require('rollup-load-plugins')({ cwd: __dirname })
const babelrc = require('babelrc-rollup').default

/**
 * Utilities and helpers
 */
const babel = require('./babel.js')
const banner = require('./banner.js')

const preprocessor = require('./preprocessor')
const plugins = require('./postcss')

/**
 * Package being built and supporting consts
 */
const pkg = require(path.join(process.cwd(), './package.json'))
const external = Object.keys(Object.assign({}, pkg.dependencies, pkg.devDependencies))
const libraryName = pkg.name.split('/').pop()

/**
 * Options for HTML minifier
 */
const htmlMinifierOptions = {
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  quoteCharacter: "'",
  removeComments: true
}

export default {
  input: pkg.preup.src,
  external,
  output: {
    name: libraryName,
    file: `dist/${libraryName}.js`,
    format: 'cjs'
  },
  plugins: [
    // Replacements to make `import * as ...` work with babel
    $.replace({ '*': 'import', delimiters: ['import ', ' as'] }),
    // Replacements to consider NODE_ENV optimizations
    $.replace({ 'process.env.NODE_ENV': JSON.stringify('PRODUCTION') }),
    // minify HTML
    $.html({ htmlMinifierOptions }),
    // inline JSON
    $.json({ preferConst: true }),
    // inline images :(
    $.image(),
    // process css using postcss with appropriate preprocessor
    $.postcss({
      preprocessor, // TODO: node-sass resolves incorrect relative import paths
      extract: `dist/${libraryName}.css`,
      to: `dist/${libraryName}.css`,
      extensions: ['.scss', '.less', '.css'],
      plugins
    }),
    $.babel(
      babelrc({
        addExternalHelpersPlugin: false,
        externalHelpers: true,
        config: babel,
        exclude: 'node_modules/**',
        addModuleOptions: false,
        babelrc: false
      })
    ),
    $.commonjs(),
    $.license({ banner }),
    $.filesize()
  ]
}
