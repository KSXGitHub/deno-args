import {
  ArgumentExtractor,
  ValueExtractor
} from './types.ts'

import {
  ok,
  find
} from './utils.ts'

type Flag = <Name extends string> (name: Name) => ArgumentExtractor<Name, boolean>
export const Flag: Flag = name => ({
  name,
  extract (args) {
    const res = find(args, x => x.isFlag && x.value === name)
    if (!res) {
      return ok({
        value: false,
        remainingArgs: args
      })
    }
    const remainingArgs = [
      ...args.slice(0, res.index),
      ...args.slice(res.index + 1)
    ]
    return ok({
      value: true,
      remainingArgs
    })
  }
})

export const Option = <Name extends string, Value> (
  name: Name,
  descriptor: OptionDescriptor<Value>
): ArgumentExtractor<Name, Value> => ({
  name,
  extract (args) {
    const res = find(args, x => x.isFlag && x.value === name)
    if (!res) throw new Error('Unimplemented') // TODO
    const valPos = res.index + 1
    if (args.length <= valPos) throw new Error('Unimplemented') // TODO
    const { isFlag, value: raw } = args[valPos]
    if (isFlag) throw new Error('Unimplemented') // TODO
    const parseResult = descriptor.type([raw])
    if (!parseResult.tag) return parseResult
    const remainingArgs = [
      ...args.slice(0, res.index),
      ...args.slice(valPos + 1)
    ]
    return ok({
      value: parseResult.value,
      remainingArgs
    })
  }
})

export interface OptionDescriptor<Value> {
  readonly type: ValueExtractor<Value, [string]>
  readonly describe?: string
  readonly alias?: readonly string[]
}
