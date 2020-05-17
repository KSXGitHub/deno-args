import args from '../../../lib/wrapper.ts'
import {
  EarlyExitFlag,
  Flag,
  CountFlag,
  Option,
  PartialOption,
  CollectOption,
  DrainOption,
  DRAIN_UNTIL_FLAG,
  DRAIN_ALL,
} from '../../../lib/flag-types.ts'
import {
  FiniteNumber,
  Integer,
  Text,
  Choice,
} from '../../../lib/value-types.ts'
import { fmtTestName } from '../../utils.ts'

export const setup = () =>
  args
    .describe('Top level command')
    .with(EarlyExitFlag('early-exit', {
      exit() {
        throw 'Not meant to be called!'
      },
    }))
    .with(Flag('foo', {
      alias: ['f'],
      describe: 'Boolean flag of foo',
    }))
    .with(Flag('bar'))
    .with(CountFlag('count', {
      alias: ['c'],
      describe: 'Counting',
    }))
    .with(Option('number', {
      alias: ['N'],
      type: FiniteNumber,
      describe: 'An integer or a floating-point number',
    }))
    .with(Option('integer', {
      type: Integer,
      describe: 'An arbitrary large integer',
    }))
    .with(Option('text', {
      type: Text,
    }))
    .with(PartialOption('partial-integer', {
      type: Integer,
      describe: 'An optional integer',
      default: BigInt('123'),
    }))
    .with(Option('choice', {
      type: Choice<123 | 'foo' | 456 | 'bar' | '789'>(
        { value: 123 },
        { value: 'foo' },
        { value: 456, describe: 'Not 123' },
        { value: 'bar', describe: 'Not Foo' },
        { value: '789', describe: 'Not a number' },
      ),
      describe: 'Choice to make',
    }))
    .with(CollectOption('collect', {
      type: Text,
      describe: 'Text segments',
    }))
    .with(DrainOption('drain-until-flag', {
      type: Text,
      while: DRAIN_UNTIL_FLAG,
      describe: 'Drain all arguments',
    }))
    .with(DrainOption('drain-all', {
      type: Text,
      while: DRAIN_ALL,
      describe: 'Drain all',
    }))
    .sub(
      'sub0',
      args
        .describe('Sub command without flags'),
    )
    .sub(
      'sub1',
      args
        .describe('Sub command with one flag')
        .with(Flag('test', {
          describe: 'Test flag for sub1',
        })),
    )
    .sub(
      'sub2',
      args
        .describe('Sub command with two flags')
        .with(Option('number', {
          type: FiniteNumber,
          describe: 'Number option for sub2',
        }))
        .with(Option('text', {
          type: Text,
          describe: 'Text option for sub2',
        })),
    )

export interface Case<Output> {
  readonly title: string
  readonly input: readonly string[]
  readonly output: Output
}

export const test = (
  param: Case<unknown>,
  fn: () => void | Promise<void>,
) => Deno.test(fmtTestName(param.title, param.input), fn)
