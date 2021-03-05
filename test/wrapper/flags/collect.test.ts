import { CollectOption } from '../../../lib/flag-types.ts'
import { MAIN_COMMAND, PARSE_FAILURE } from '../../../lib/symbols.ts'
import { Integer } from '../../../lib/value-types.ts'
import args from '../../../lib/wrapper.ts'
import { assertEquals } from '../../deps.ts'
import { dbg, fmtTestName } from '../../utils.ts'

const setup = () =>
  args.with(CollectOption('flag', {
    alias: ['a', 'b', 'c'],
    type: Integer,
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

testOk('no flags', [], { flag: [] })
testOk('full name', ['--flag', '123', '--flag', '456'], { flag: [123n, 456n] })
testOk('alias', ['-a', '0', '-b', '1', '-c', '2'], { flag: [0n, 1n, 2n] })
testOk('grouped', ['-abc', '123', '--flag', '456'], { flag: [123n, 456n] })

const testErr = (
  name: string,
  argv: readonly string[],
  expectedTypes: readonly string[],
  expectedMessages: string,
) =>
  Deno.test(name, () => {
    const result = setup().parse(argv)
    if (result.tag !== PARSE_FAILURE) {
      throw dbg`unexpected tag\nresult: ${result}`
    }
    assertEquals({
      types: result.error.errors.map(x => x.constructor.name),
      messages: result.error.toString(),
    }, {
      types: expectedTypes,
      messages: expectedMessages,
    })
  })

testErr(
  'missing value',
  ['--flag'],
  ['MissingValue'],
  'Option --flag requires a value but none was found',
)
testErr(
  'unexpected flag',
  ['--flag', '-X'],
  ['UnexpectedFlag'],
  'Option --flag requires a value but received flag -X instead',
)
