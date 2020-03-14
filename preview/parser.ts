import build from '../lib/build.ts'
import { HelpFlag, Flag, CountFlag, Option } from '../lib/flags.ts'
import { FiniteNumber, Integer, Text, Choice } from '../lib/values.ts'

const parser = build()
  .with(HelpFlag(() => {
    throw 'exit'
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

export { parser, parser as default }
