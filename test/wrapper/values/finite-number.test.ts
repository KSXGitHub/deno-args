import { Option } from '../../../lib/flag-types.ts'
import { MAIN_COMMAND, PARSE_FAILURE } from '../../../lib/symbols.ts'
import { FiniteNumber } from '../../../lib/value-types.ts'
import args from '../../../lib/wrapper.ts'
import { assertEquals } from '../../deps.ts'
import { dbg, fmtTestName } from '../../utils.ts'

const setup = () =>
  args.with(Option('flag', {
    type: FiniteNumber,
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

testOk('zero', ['--flag', '0'], { flag: 0 })
testOk('negative zero', ['--flag', '-0'], { flag: -0 })
testOk('positive integer', ['--flag', '123'], { flag: 123 })
testOk('negative integer', ['--flag', '-321'], { flag: -321 })
testOk('positive decimal', ['--flag', '123.456'], { flag: 123.456 })
testOk('negative decimal', ['--flag', '-654.321'], { flag: -654.321 })
testOk(
  'positive float with positive exponent',
  ['--flag', '1.2e3'],
  { flag: 1.2e3 },
)
testOk(
  'positive float with negative exponent',
  ['--flag', '1.2e-3'],
  { flag: 1.2e-3 },
)
testOk(
  'negative float with positive exponent',
  ['--flag', '-3.2e1'],
  { flag: -3.2e1 },
)
testOk(
  'negative float with negative exponent',
  ['--flag', '-3.2e-1'],
  { flag: -3.2e-1 },
)

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
  'not a valid number',
  ['--flag', 'blah blah blah'],
  ['ValueParsingFailure'],
  'Failed to parse --flag: Not a number: blah blah blah',
)
testErr(
  'NaN',
  ['--flag', 'NaN'],
  ['ValueParsingFailure'],
  'Failed to parse --flag: Not a number: NaN',
)
testErr(
  'Infinity',
  ['--flag', 'Infinity'],
  ['ValueParsingFailure'],
  'Failed to parse --flag: Not a number: Infinity',
)
testErr(
  '-Infinity',
  ['--flag', '-Infinity'],
  ['ValueParsingFailure'],
  'Failed to parse --flag: Not a number: -Infinity',
)
