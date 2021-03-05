import { Option } from '../lib/flag-types.ts'
import { PARSE_FAILURE, MAIN_COMMAND } from '../lib/symbols.ts'
import { FiniteNumber } from '../lib/value-types.ts'
import args from '../lib/wrapper.ts'

const parser = args
  .describe('Calculate multiplication or exponent')
  .sub(
    'help',
    args
      .describe('Show help'),
  )
  .sub(
    'multiply',
    args
      .describe('Calculate multiplication')
      .with(Option('a', {
        type: FiniteNumber,
      }))
      .with(Option('b', {
        type: FiniteNumber,
      })),
  )
  .sub(
    'exponent',
    args
      .describe('Calculate exponent')
      .with(Option('base', {
        type: FiniteNumber,
        alias: ['a'],
      }))
      .with(Option('exp', {
        type: FiniteNumber,
        alias: ['n'],
      })),
  )

const res = parser.parse(Deno.args)

function help(cmdPath: readonly string[] = []) {
  if (!cmdPath.length) {
    console.log('USAGE:')
    console.log('  <program> help [command]')
    console.log('  <program> multiply -a <number> -b <number>')
    console.log('  <program> exponent --base <number> --exp <number>')
  }
  console.log(parser.help(...cmdPath))
}

switch (res.tag) {
  case PARSE_FAILURE:
    console.error(res.error.toString())
    Deno.exit(1)
  case MAIN_COMMAND: {
    const remaining = res.remaining().rawValues()
    if (remaining.length) {
      console.error(`Invalid subcommand: ${remaining[0]}`)
    } else {
      console.error('Missing subcommand')
    }
    help()
    Deno.exit(1)
  }
  case 'help':
    help(res.remaining().rawValues())
    break
  case 'multiply': {
    const { a, b } = res.value.value
    console.log(a * b)
    break
  }
  case 'exponent': {
    const { base, exp } = res.value.value
    console.log(base ** exp)
    break
  }
}
