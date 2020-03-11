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

export function partition<X> (xs: Iterable<X>, fn: (x: X) => boolean) {
  const left: X[] = []
  const right: X[] = []
  for (const x of xs) {
    (fn(x) ? left : right).push(x)
  }
  return [left, right]
}
