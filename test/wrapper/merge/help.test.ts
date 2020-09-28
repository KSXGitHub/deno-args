import { assertEquals, path, fs, dirname } from '../../deps.ts'
import { setup } from './setup.ts'

const __dirname = dirname(import.meta)

function fmtStr(text: string): string {
  const middle = text
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim()
  return '\n' + middle + '\n'
}

const fmtName = (cmdPath: readonly string[]) => ['help', ...cmdPath].join(' ')

const testHelp = (cmdPath: readonly string[]) =>
  Deno.test(fmtName(cmdPath), async () => {
    const fileBaseName = ['help', ...cmdPath].join('-')
    const expected = await Deno.readFile(path.join(__dirname, `./${fileBaseName}.output.txt`))
      .then(blob => new TextDecoder().decode(blob))
    const received = setup().help(...cmdPath)
    assertEquals(fmtStr(received), fmtStr(expected))
  })

testHelp([])
testHelp(['sub'])
