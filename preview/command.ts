import Command from '../lib/commands.ts'
import { Flag, CountFlag, Option, EarlyExitFlag } from '../lib/argument-extractors.ts'
import { FiniteNumber, Integer, Text, Choice } from '../lib/value-extractors.ts'

const command = Command()
  .with(EarlyExitFlag('help', {
    describe: 'Show help',
    exit () {
      // throw parser.help()
      throw new Error('Unimplemented')
    }
  }))
  .with(Flag('foo', {
    alias: ['f'],
    describe: 'Boolean flag of foo'
  }))
  .with(Flag('bar'))
  .with(CountFlag('count', {
    alias: ['c'],
    describe: 'Counting'
  }))
  .with(Option('number', {
    alias: ['N'],
    type: FiniteNumber,
    describe: 'An integer or a floating-point number'
  }))
  .with(Option('integer', {
    type: Integer,
    describe: 'An arbitrary large integer'
  }))
  .with(Option('text', {
    type: Text
  }))
  .with(Option('choice', {
    type: Choice<123 | 'foo' | 456 | 'bar' | '789'>(
      { value: 123 },
      { value: 'foo' },
      { value: 456, describe: 'Not 123' },
      { value: 'bar', describe: 'Not Foo' },
      { value: '789', describe: 'Not a number' }
    ),
    describe: 'Choice to make'
  }))
  .subCommand('foo', subCmd => subCmd
    .with(Flag('abc', {
      describe: 'Description of --abc'
    }))
    .with(Option('def', {
      type: Text,
      describe: 'Description of --def'
    }))
  )
  .subCommand('bar', subCmd => subCmd
    .with(Option('ghi', {
      type: Choice({ value: 'G' }, { value: 'H' }, { value: 'I' })
    }))
  )

export { command, command as default }
