import {
  ArgumentExtractor,
  ValueExtractor
} from './types.ts'

import {
  ok,
  flag,
  partitionFlags
} from './utils.ts'

const fmtAliasList = (alias?: readonly string[]) => alias?.length
  ? ` (alias ${alias.map(flag).join(' ')})`
  : ''

const fmtDescSuffix = (describe?: string) => describe
  ? `:\t${describe}`
  : ''

export const Flag = <Name extends string> (
  name: Name,
  descriptor: FlagDescriptor = {}
): ArgumentExtractor<Name, boolean> => ({
  name,
  extract (args) {
    const [findRes, remainingArgs] = partitionFlags(
      args,
      [name, ...descriptor.alias || []]
    )
    if (!findRes.length) {
      return ok({
        value: false,
        remainingArgs: args
      })
    }
    return ok({
      value: true,
      remainingArgs
    })
  },
  help () {
    const alias = fmtAliasList(descriptor.alias)
    const suffix = fmtDescSuffix(descriptor.describe)
    return `${flag(name)}${alias}${suffix}`
  }
})

export interface FlagDescriptor {
  readonly describe?: string
  readonly alias?: readonly string[]
}

export const Option = <Name extends string, Value> (
  name: Name,
  descriptor: OptionDescriptor<Value>
): ArgumentExtractor<Name, Value> => ({
  name,
  extract (args) {
    const [findRes] = partitionFlags(
      args,
      [name, ...descriptor.alias || []]
    ) // TODO: Change this line to something more efficient
    if (!findRes.length) throw new Error('Unimplemented') // TODO
    if (findRes.length !== 1) throw new Error('Unimplemented') // TODO
    const [res] = findRes
    const valPos = res.index + 1
    if (args.length <= valPos) throw new Error('Unimplemented') // TODO
    const { isFlag, value: raw } = args[valPos]
    if (isFlag) throw new Error('Unimplemented') // TODO
    const parseResult = descriptor.type.extract([raw])
    if (!parseResult.tag) return parseResult
    const remainingArgs = [
      ...args.slice(0, res.index),
      ...args.slice(valPos + 1)
    ]
    return ok({
      value: parseResult.value,
      remainingArgs
    })
  },
  help () {
    const typeName = descriptor.type.help()
    const alias = fmtAliasList(descriptor.alias)
    const suffix = fmtDescSuffix(descriptor.describe)
    return `${flag(name)} <${typeName}>${alias}${suffix}`
  }
})

export interface OptionDescriptor<Value> {
  readonly type: ValueExtractor<Value, [string]>
  readonly describe?: string
  readonly alias?: readonly string[]
}
