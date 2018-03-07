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
  quoteCharacter: "'",
  removeComments: true
}

export default {
  input: pkg.preup.src,
  external,
  output: {
    name: libraryName,
    file: `dist/${libraryName}.js`,
    format: 'cjs',
    exports: 'named'
  },
  plugins: [
    // Replacements to make TS `import * as ...` work with babel
    $.replace({ '*': 'import', delimiters: ['import ', ' as'] }),
    // Replacements to consider NODE_ENV optimizations
    $.replace({ 'process.env.NODE_ENV': JSON.stringify('PRODUCTION') }),
    // minify HTML
    $.html({ htmlMinifierOptions }),
    // inline JSON
    $.json({ preferConst: true }),
    // inline images :(
    $.image(),
    $.postcss({
      extract: `dist/${libraryName}.css`,
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
    $.cleanup({ comments: 'none' }),
    $.license({ banner }),
    $.filesize()
  ]
}
