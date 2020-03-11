import { ArgvItem } from './types.ts'

export function * iterateArguments (args: readonly string[]) {
  let fn = (value: string): ArgvItem[] => {
    if (value === '--') {
      fn = value => ([{ isFlag: false, value }])
      return []
    }

    if (value.startsWith('--')) {
      return [{
        isFlag: true,
        value: value.slice('--'.length)
      }]
    }

    if (value.startsWith('-')) {
      return [...value.slice('_'.length)].map(value => ({
        isFlag: true,
        value
      }))
    }

    return [{
      isFlag: false,
      value
    }]
  }

  for (const x of args) {
    yield * fn(x)
  }
}
