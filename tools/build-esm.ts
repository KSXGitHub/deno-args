import {
  path,
  fs,
  dirname
} from './deps.ts'

const __dirname = dirname(import.meta)
const root = path.dirname(__dirname)
const distESM = 'nodejs/index.mjs'
Deno.chdir(root)
await fs.emptyDir('nodejs')
await bundle(distESM)

async function bundle (outputFile: string) {
  const options: Deno.CompilerOptions = {
    target: 'es2018',
    lib: ['es2020'],
    declaration: false,
    preserveConstEnums: true,
    strict: true,
    noUnusedLocals: false,
    noUnusedParameters: false,
    noImplicitReturns: false,
    noFallthroughCasesInSwitch: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true
  }

  const [diagnostic, output] = await Deno.bundle('lib/index.ts', undefined, options)

  if (diagnostic) {
    printDiagnostic(diagnostic)
    console.error('FAILED')
    Deno.exit(1)
  }

  await fs.writeFileStr(outputFile, output)
}

function printDiagnostic (diagnostic: Iterable<Deno.DiagnosticItem>) {
  for (const item of diagnostic) {
    console.error(item.scriptResourceName + ':' + item.lineNumber)
    console.error('  ', Deno.DiagnosticCategory[item.category], 'TS' + item.code, item.message)
    console.error()
  }
}
