import { Option } from '../../../lib/flag-types.ts'
import { Integer } from '../../../lib/value-types.ts'
import { MAIN_COMMAND, PARSE_FAILURE } from '../../../lib/symbols.ts'
import args from '../../../lib/wrapper.ts'
import { assertEquals } from '../../deps.ts'
import { dbg, fmtTestName } from '../../utils.ts'

const setup = () => args.with(Option('flag', {
  type: Integer
}))

const testOk = (
  title: string,
  argv: readonly string[],
  expectedValue: unknown
) => Deno.test(fmtTestName(title, argv), () => {
  const result = setup().parse(argv)
  if (result.tag !== MAIN_COMMAND) {
    throw dbg`unexpected tag\nresult: ${result}`
  }
  assertEquals(result.value, expectedValue)
})

testOk('zero', ['--flag', '0'], { flag: 0n })
testOk('negative zero', ['--flag', '-0'], { flag: 0n })
testOk('positive integer', ['--flag', '123'], { flag: 123n })
testOk('negative integer', ['--flag', '-321'], { flag: -321n })
testOk(
  'very big integer',
  ['--flag', '81129638414606663681390495662081'],
  { flag: 81129638414606663681390495662081n }
)

const testErr = (
  name: string,
  argv: readonly string[],
  expectedTypes: readonly string[],
  expectedMessages: string
) => Deno.test(name, () => {
  const result = setup().parse(argv)
  if (result.tag !== PARSE_FAILURE) {
    throw dbg`unexpected tag\nresult: ${result}`
  }
  assertEquals({
    types: result.error.errors.map(x => x.constructor.name),
    messages: result.error.toString()
  }, {
    types: expectedTypes,
    messages: expectedMessages
  })
})


testErr(
  'not a valid number', ['--flag', 'blah'],
  ['ValueParsingFailure'],
  'Failed to parse --flag: Not an integer: blah (SyntaxError: Cannot convert blah to a BigInt)'
)
testErr(
  'floating point', ['--flag', '123.456'],
  ['ValueParsingFailure'],
  'Failed to parse --flag: Not an integer: 123.456 (SyntaxError: Cannot convert 123.456 to a BigInt)'
)
