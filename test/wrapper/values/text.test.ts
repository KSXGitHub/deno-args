import { Option } from '../../../lib/flag-types.ts'
import { Text } from '../../../lib/value-types.ts'
import { MAIN_COMMAND } from '../../../lib/symbols.ts'
import args from '../../../lib/wrapper.ts'
import { assertEquals } from '../../deps.ts'
import { dbg, fmtTestName } from '../../utils.ts'

const setup = () =>
  args.with(Option('flag', {
    type: Text,
  }))

const testOk = (
  title: string,
  argv: readonly string[],
  expectedValue: unknown,
) =>
  Deno.test(fmtTestName(title, argv), () => {
    const result = setup().parse(argv)
    if (result.tag !== MAIN_COMMAND) {
      throw dbg`unexpected tag\nresult: ${result}`
    }
    assertEquals(result.value, expectedValue)
  })

testOk('no whitespace', ['--flag', 'hello'], { flag: 'hello' })
testOk('with whitespaces', ['--flag', 'hello world'], { flag: 'hello world' })
testOk('empty', ['--flag', ''], { flag: '' })
