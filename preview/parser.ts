import args from '../lib/wrapper.ts'
import { Flag, CountFlag, Option, EarlyExitFlag } from '../lib/flag-types.ts'
import { FiniteNumber, Integer, Text, Choice } from '../lib/value-types.ts'

const parser = args
  .with(EarlyExitFlag('help', {
    describe: 'Show help',
    exit () {
      console.log(parser.help())
      return Deno.exit(0)
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
  .sub('sub0', args)
  .sub('sub1', args
    .with(Flag('test', {
      describe: 'Test flag for sub1'
    }))
  )
  .sub('sub2', args
    .with(Option('number', {
      type: FiniteNumber,
      describe: 'Number option for sub2'
    }))
    .with(Option('text', {
      type: Text,
      describe: 'Text option for sub2'
    }))
  )

export { parser, parser as default }
