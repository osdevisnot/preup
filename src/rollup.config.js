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
const external = Object.keys(Object.assign({}, pkg.dependencies, pkg.devDependencies, pkg.peerDependencies))
const libraryName = pkg.name.split('/').pop()
const exportName = libraryName.replace(/-([a-z])/g, function(g) {
  return g[1].toUpperCase()
})

/**
 * Options for HTML minifier
 */
const htmlMinifierOptions = {
  collapseWhitespace: true,
  quoteCharacter: "'",
  removeComments: true
}

const tsHack = (pkg.preup.compiler && pkg.preup.compiler !== 'babel') || true

const rollupPlugins = [
  // Replacements to make TS `import * as ...` work with babel
  tsHack && $.replace({ '*': 'import', delimiters: ['import ', ' as'] }),
  // Replacements to consider NODE_ENV optimizations
  $.replace({ 'process.env.NODE_ENV': JSON.stringify('PRODUCTION') }),
  // minify HTML
  $.html({ htmlMinifierOptions }),
  // inline JSON
  $.json({ preferConst: true }),
  // inline images :(
  $.image(),
  // inline everything else :(
  $.url({
    limit: 10 * 1024,
    include: ['**/*.woff', '**/*.woff2']
  }),
  $.osdev.postcss({
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
].filter(Boolean)

let config = {
  input: pkg.preup.src,
  external,
  output: [
    {
      name: exportName,
      file: `dist/${libraryName}.js`,
      format: 'cjs',
      exports: 'named'
    },
    { name: exportName, file: `dist/${libraryName}.umd.js`, format: 'umd' },
    { name: exportName, file: `dist/${libraryName}.es5.js`, format: 'iife' }
  ],
  plugins: rollupPlugins
}

if (pkg.preup.multi) {
  config = [config]
  Object.keys(pkg.preup.multi).forEach(entry => {
    const gloablName = entry.replace(/-([a-z])/g, function(g) {
      return g[1].toUpperCase()
    })
    config.push({
      input: pkg.preup.multi[entry],
      external,
      output: {
        file: `dist/${entry}.es5.js`,
        format: 'iife',
        name: gloablName,
        globals: gloablName
      },
      plugins: rollupPlugins
    })
  })
}

export default config
