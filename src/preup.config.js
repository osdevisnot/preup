#!/usr/bin/env node

/**
 * node packages
 */
const path = require('path')
const fs = require('fs')
const sync = require('child_process').execSync

/**
 * Rollup and plugins
 */
const rollup = require('rollup')
const $ = require('rollup-load-plugins')({ cwd: __dirname })
const babelrc = require('babelrc-rollup').default

/**
 * Additional Helper libs
 *  - Dependency Analyzer
 *  - Cross Platform delete
 */
const detective = require('detective')
const del = require('del')

/**
 * Utilities and helpers
 */
const babel = require('./babel.js')
const banner = require('./banner.js')
const copy = require('./copy')
const commit = require('./commit.js')()
const preprocessor = require('./preprocessor')
const plugins = require('./postcss')

/**
 * Package being built and supporting consts
 */
const pkg = require(path.join(process.cwd(), './package.json'))
const external = Object.keys(Object.assign({}, pkg.dependencies, pkg.devDependencies))
const libraryName = pkg.name.split('/').pop()

/**
 * Replacements to make `import * as ...` work with babel
 */
const replacements = { '*': 'import', delimiters: ['import ', ' as'] }
/**
 * Options for HTML minifier
 */
const htmlMinifierOptions = {
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  quoteCharacter: "'",
  removeComments: true
}

Promise.resolve()
  /**
   * Clean the dist folder
   */
  .then(() => del(['dist/*']))
  /**
   * Run build
   */
  .then(() => {
    return (
      rollup
        .rollup({
          input: pkg.preup.src,
          external,
          plugins: [
            $.replace(replacements),
            $.html({ htmlMinifierOptions }),
            $.json({ preferConst: true }),
            $.image(),
            $.postcss({
              preprocessor,
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
        })
        /**
         * Write the bundle
         */
        .then(bundle =>
          bundle.write({
            name: libraryName,
            file: `dist/${libraryName}.js`,
            format: 'cjs'
          })
        )
        /**
         * Copy package.json and license files
         */
        .then(() => {
          // write license and npmrc file if found ...
          ;['LICENSE', '.npmrc'].forEach(file => copy(file))
          // detect dependencies ...
          const requires = detective(fs.readFileSync(path.join(process.cwd(), 'dist', `${libraryName}.js`), 'utf-8'))
          const release = { peerDependencies: {} }
          // mark code dependencies as peer dependencies
          requires.forEach(req => {
            if (pkg.dependencies && pkg.dependencies[req]) {
              release.peerDependencies[req] = pkg.dependencies[req]
            } else {
              release.peerDependencies[req] = '*'
              console.warn(`ERROR: ${req} is not found in package.json deps !!`)
            }
          })
          ;['name', 'version', 'description', 'main', 'license'].forEach(field => (release[field] = pkg[field]))
          release.main = `${libraryName}.js`
          release.style = `${libraryName}.css`
          fs.writeFileSync(path.join('dist', 'package.json'), JSON.stringify(release, null, '  '), 'utf-8')
          let publish = false
          ;['major', 'minor', 'patch'].forEach(rel => {
            if ((process.argv[2] && process.argv[2] === rel) || (commit && commit.indexOf(`release ${rel}`) > -1)) {
              publish = rel
            }
          })
          if (publish) {
            ;[
              'git config user.email "preup@gmail.com"',
              'git config user.name "preup"',
              `npm version ${publish} --quiet`
            ].forEach(cmd => {
              sync(cmd, { stdio: [0, 1, 2] })
            })
            ;[`npm version ${publish} --quiet`, `npm publish --quiet`].forEach(cmd => {
              sync(cmd, { stdio: [0, 1, 2], cwd: 'dist' })
            })
          }
        })
    )
  })
  .catch(err => console.error(err.stack))
