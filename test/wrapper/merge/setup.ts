import { BinaryFlag, CountFlag } from '../../../lib/flag-types.ts'
import args from '../../../lib/wrapper.ts'
import { fmtTestName } from '../../utils.ts'

export function setup() {
  const shared = args
    .describe('<Description of shared flags>')
    .with(BinaryFlag('shared-binary-flag', {
      describe: 'Shared binary flag',
    }))
    .with(CountFlag('shared-count-flag', {
      describe: 'Shared count flag',
    }))
  const parser = args
    .describe('<Description of main command>')
    .with(BinaryFlag('before-merge', {
      describe: 'Flag defined before merge operation',
    }))
    .merge(shared)
    .with(BinaryFlag('after-merge', {
      describe: 'Flag defined after merge operation',
    }))
    .sub(
      'sub',
      args
        .describe('<Description of sub command>')
        .with(BinaryFlag('sub-binary-flag', {
          describe: "Sub's own binary flag",
        }))
        .merge(shared),
    )
  return parser
}

export interface Case<Output> {
  readonly title: string
  readonly input: readonly string[]
  readonly output: Output
}

export const test = (
  param: Case<unknown>,
  fn: () => void | Promise<void>,
) => Deno.test(fmtTestName(param.title, param.input), fn)
