import { Option } from '../lib/flag-types.ts'
import { PARSE_FAILURE, MAIN_COMMAND } from '../lib/symbols.ts'
import { Text } from '../lib/value-types.ts'
import args from '../lib/wrapper.ts'

const globalOptions = args
  .with(Option('shared-opt', {
    type: Text,
  }))

const parser = args
  .with(Option('top-level-opt', {
    type: Text,
  }))
  .sub('help', args.describe('Show help'))
  .sub(
    'sub1',
    globalOptions
      .with(Option('sub1-opt', {
        type: Text,
      })),
  )
  .sub(
    'sub2',
    globalOptions.with(Option('sub2-opt', {
      type: Text,
    })),
  )

const res = parser.parse(Deno.args)

switch (res.tag) {
  case PARSE_FAILURE:
    console.error(res.error.toString())
    Deno.exit(1)
  case MAIN_COMMAND:
    console.log('no command', res.value)
    break
  case 'help':
    console.log(parser.help(...res.value.remaining().rawValues()))
    break
  case 'sub1':
  case 'sub2':
    console.log('command', res.tag, res.value.value)
    break
}
