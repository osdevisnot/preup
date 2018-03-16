#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const sync = require('child_process').execSync
const del = require('del')
const detective = require('detective')

const preup = require(path.join(__dirname, '..', 'package.json'))

const copy = require('./copy')
const commit = require('./commit.js')()

const rollupConfig = path.join(__dirname, 'rollup.config.js')
const rollupPath = path.join(__dirname, '..', 'node_modules', '.bin', 'rollup')

const pkg = require(path.join(process.cwd(), './package.json'))
const libraryName = pkg.name.split('/').pop()

const isWatching = process.argv[2] === 'watch'

const rollupFlags = isWatching ? '-wc' : '-c'

const command = `${rollupPath} ${rollupFlags} ${rollupConfig}`

const cleanDep = dep =>
  dep
    .split('/')
    .splice(0, 2)
    .join('/')

const hasCommand = (pkg.scripts && pkg.scripts.preup) || false

console.log(`preup version ${preup.version}`)

Promise.resolve()
  /**
   * Clean the dist folder
   */
  .then(_ => del(['dist/*']))
  /**
   * if we have 'preup' in npm scripts, run those first
   */
  .then(_ => hasCommand && sync('npm run preup', { stdio: [0, 1, 2] }))
  /**
   * Copy current package.json to dist for watch mode
   */
  .then(_ => {
    if (isWatching) {
      pkg.main = `${libraryName}.js`
      pkg.style = `${libraryName}.css`
      fs.writeFileSync(path.join('dist', 'package.json'), JSON.stringify(pkg, null, '  '), 'utf-8')
    }
  })
  /**
   * Rollup Compile
   */
  .then(_ => sync(command, { stdio: [0, 1, 2] }))
  /**
   * Manage release and publish
   */
  .then(_ => {
    // write license and npmrc file if found ...
    ;['LICENSE', '.npmrc'].forEach(file => copy(file))
    // detect dependencies ...
    const requires = detective(fs.readFileSync(path.join(process.cwd(), 'dist', `${libraryName}.js`), 'utf-8'))
    const release = { peerDependencies: {} }
    // mark code dependencies as peer dependencies
    requires.forEach(req => {
      if (pkg.dependencies && pkg.dependencies[req]) {
        release.peerDependencies[cleanDep(req)] = pkg.dependencies[req]
      } else if (pkg.devDependencies && pkg.devDependencies[req]) {
        release.peerDependencies[cleanDep(req)] = pkg.devDependencies[req]
      } else {
        release.peerDependencies[cleanDep(req)] = '*'
        console.warn(`Warn: ${req} is not found in package.json deps, assuming * for peerDependency !`)
      }
    })
    ;['name', 'version', 'description', 'main', 'license'].forEach(field => (release[field] = pkg[field]))
    release.main = `${libraryName}.js`
    release.style = `${libraryName}.css`
    release.preupVersion = preup.version
    fs.writeFileSync(path.join('dist', 'package.json'), JSON.stringify(release, null, '  '), 'utf-8')
    let publish = false
    ;['major', 'minor', 'patch'].forEach(rel => {
      if (process.argv[2] && process.argv[2] === rel) {
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
      // Redo the version command in `dist` directory to get correct version for publish
      ;[`npm version ${publish} --quiet`, `npm publish --quiet`].forEach(cmd => {
        sync(cmd, { stdio: [0, 1, 2], cwd: 'dist' })
      })
    }
  })
  .catch(err => {
    console.error(err.stack)
    process.exit(1)
  })
