import {
  assertEquals,
  path,
  fs,
  dirname
} from '../../deps.ts'

import { setup } from './setup.ts'

const __dirname = dirname(import.meta)

function fmtStr (text: string): string {
  const middle = text
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim()
  return '\n' + middle + '\n'
}

Deno.test('main command', async () => {
  const expected = await fs.readFileStr(path.join(__dirname, './help.output.txt'))
  const received = setup().help()
  assertEquals(fmtStr(received), fmtStr(expected))
})
