import {
  path,
  fs,
  dirname,
  traverseFileSystem
} from './deps.ts'

const __dirname = dirname(import.meta)
const libPath = path.join(__dirname, '../lib')
const distESM = path.join(__dirname, '../nodejs/esm')
const distCJS = path.join(__dirname, '../nodejs/cjs')
await fs.emptyDir(distESM)
await fs.emptyDir(distCJS)
Deno.chdir(libPath)

const options: Deno.CompilerOptions = {
  target: 'es2018',
  module: 'es2015',
  lib: ['es2020'],
  declaration: true,
  sourceMap: false,
  preserveConstEnums: true,
  strict: true,
  noUnusedLocals: false,
  noUnusedParameters: false,
  noImplicitReturns: false,
  noFallthroughCasesInSwitch: true,
  experimentalDecorators: true,
  emitDecoratorMetadata: true
}

const sourceDict: {
  [_: string]: string
} = {}

for await (const item of traverseFileSystem('.', () => true)) {
  if (item.isDirectory) continue

  const basename = item.info.name!
  const filename = path.join(item.container, basename)

  if (basename === 'deps.ts') {
    console.info(':: bundle', filename)
    const [diagnostic, output] = await Deno.bundle(filename)
    if (diagnostic) printDiagnostic(diagnostic)
    sourceDict[path.join('/', filename)] = output
  } else {
    console.info(':: copy', filename)
    sourceDict[path.join('/', filename)] = await fs.readFileStr(filename)
  }
}

console.info(':: compile')
const [diagnostic, output] = await Deno.compile('/index.ts', sourceDict, options)
if (diagnostic) printDiagnostic(diagnostic)

for (const [key, value] of Object.entries({ ...sourceDict, ...output })) {
  const filename = path.join(distESM, key)
  console.log(':: write', filename)
  await fs.ensureFile(filename)
  await fs.writeFileStr(filename, value)
}

function printDiagnostic (diagnostic: Iterable<Deno.DiagnosticItem>) {
  for (const item of diagnostic) {
    console.error(item.scriptResourceName + ':' + item.lineNumber)
    console.error('  ', Deno.DiagnosticCategory[item.category], 'TS' + item.code, item.message)
    console.error()
  }
}
