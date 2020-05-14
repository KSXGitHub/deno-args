#! /usr/bin/env -S deno run --allow-all --unstable

import { assertEquals } from 'https://deno.land/std@21a4e9cc58aeed55cb597d2f986cca56f0aec819/testing/asserts.ts'

import * as path from 'https://deno.land/std@21a4e9cc58aeed55cb597d2f986cca56f0aec819/path/mod.ts'

import {
  desc,
  task,
  sh,
  run,
  readFile,
  writeFile,
  glob,
} from 'https://raw.githubusercontent.com/KSXGitHub/drake/0.0.0/mod.ts'

import { dirname } from 'https://deno.land/x/dirname/mod.ts'

import { pipe } from 'https://deno.land/x/compose@1.3.0/index.js'

const {
  UPDATE = 'false',
  SHELL,
} = Deno.env.toObject()

const __dirname = dirname(import.meta)

const shouldUpdate = UPDATE.toLowerCase() === 'true'

if (!SHELL || path.basename(SHELL) !== 'zsh') {
  throw `Invalid $SHELL. Expecting zsh, received ${SHELL}.`
}

const compareFile = (a: string, b: string): boolean =>
  Deno.statSync(a).size === Deno.statSync(b).size &&
  readFile(a) === readFile(b)

desc('Sync markdown files')
task('markdown', [], async () => {
  let outdated: string[] = []
  type UpdateFunc = (name: string, src: string, dst: string) => void
  const update: UpdateFunc = shouldUpdate
    ? (name, src, dst) => {
      console.log(`File ${name} is out-of-date. Syncing.`)
      Deno.copyFileSync(src, dst)
    }
    : name => outdated.push(name)
  for (const name of glob('*.md')) {
    const src = path.join(__dirname, name)
    const dst = path.join(__dirname, 'lib', name)
    if (compareFile(src, dst)) {
      console.log(`File ${name} is up-to-date. Skipping.`)
    } else {
      update(name, src, dst)
    }
  }
  if (outdated.length) {
    for (const name of outdated) {
      console.error(`File ${name} is outdated`)
    }
    throw 'Some files are not up-to-date'
  }
})

desc('Fetch and compile dependencies')
task('cache', [], async () => {
  await sh('deno cache **/*.ts --unstable')
})

desc('Run tests')
task('test', ['cache'], async () => {
  const permissions = [
    '--allow-read',
  ]
  await sh(`deno test ${permissions.join(' ')} test/**/*.test.ts`)
})

desc('Run sane-fmt')
task('fmt', [], async () => {
  await sh(shouldUpdate ? 'sane-fmt --write' : 'sane-fmt')
})

desc('Run all tasks')
task('all', [
  'markdown',
  'cache',
  'test',
  'fmt',
])

run()
