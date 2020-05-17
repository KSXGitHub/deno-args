import { DrainOption, DRAIN_UNTIL_FLAG } from '../../../lib/flag-types.ts'
import { Integer } from '../../../lib/value-types.ts'
import { MAIN_COMMAND, PARSE_FAILURE } from '../../../lib/symbols.ts'
import args from '../../../lib/wrapper.ts'
import { assertEquals } from '../../deps.ts'
import { dbg, fmtTestName } from '../../utils.ts'

const setup = () =>
  args.with(DrainOption('flag', {
    alias: ['a', 'b', 'c'],
    type: Integer,
    while: DRAIN_UNTIL_FLAG,
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

testOk('no arguments', [], { flag: [] })
const argsPrefix = ['a', 'b', 'c']
testOk('no flags', [...argsPrefix], { flag: [] })
testOk(
  'full name',
  [...argsPrefix, '--flag', '0', '1', '2'],
  { flag: [0n, 1n, 2n] },
)
testOk('alias', [...argsPrefix, '-a', '0', '1', '2'], { flag: [0n, 1n, 2n] })
testOk('alias', [...argsPrefix, '-b', '0', '1', '2'], { flag: [0n, 1n, 2n] })
testOk('alias', [...argsPrefix, '-c', '0', '1', '2'], { flag: [0n, 1n, 2n] })
testOk(
  'another flag',
  [...argsPrefix, '--flag', '0', '1', '2', '--another-flag'],
  { flag: [0n, 1n, 2n] },
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
  'conflict flags',
  ['--flag', '0', '1', '2', '-a', '3', '4', '-b', '5'],
  ['ConflictFlags'],
  'Conflicting options: --flag -a -b -c',
)
