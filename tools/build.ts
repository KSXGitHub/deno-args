import {
  path,
  fs,
  dirname,
  traverseFileSystem
} from './deps.ts'

const __dirname = dirname(import.meta)
const root = path.dirname(__dirname)
const distESM = 'nodejs/esm'
const distCJS = 'nodejs/cjs'
Deno.chdir(root)
await fs.emptyDir(distESM)
await fs.emptyDir(distCJS)

console.info('=> CommonJS')
await build('commonjs', distCJS)

console.info('=> ES Module')
await build('es2015', distESM)

async function build (
  module: 'es2015' | 'commonjs',
  outDir: string
) {
  const options: Deno.CompilerOptions = {
    module,
    outDir,
    target: 'es2018',
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

  for await (const item of traverseFileSystem('lib', () => true)) {
    if (item.isDirectory) continue

    const basename = item.info.name!
    const filename = path.join(item.container, basename)

    if (basename === 'deps.ts') {
      console.info('  -> bundle', filename)
      const [diagnostic, output] = await Deno.bundle(filename)
      if (diagnostic) printDiagnostic(diagnostic)
      sourceDict[path.join('/', filename)] = output
    } else {
      console.info('  -> copy', filename)
      sourceDict[path.join('/', filename)] = await fs.readFileStr(filename)
    }
  }

  console.info('  -> compile')
  const [diagnostic, output] = await Deno.compile('/lib/index.ts', sourceDict, options)
  if (diagnostic) printDiagnostic(diagnostic)

  for (const [filename, content] of Object.entries(output)) {
    console.log('  -> write', filename)
    await fs.ensureFile(filename)
    await fs.writeFileStr(filename, content)
  }
}

function printDiagnostic (diagnostic: Iterable<Deno.DiagnosticItem>) {
  for (const item of diagnostic) {
    console.error(item.scriptResourceName + ':' + item.lineNumber)
    console.error('  ', Deno.DiagnosticCategory[item.category], 'TS' + item.code, item.message)
    console.error()
  }
}
