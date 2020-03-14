import {
  ArgumentExtractor,
  ValueExtractor
} from './types.ts'

import {
  ok,
  err,
  flag,
  partitionFlags,
  findFlags
} from './utils.ts'

import {
  MissingFlag,
  ConflictFlags,
  MissingValue,
  UnexpectedFlag,
  ValueParsingFailure
} from './flag-errors.ts'

const listFlags = <Name extends string> (
  name: Name,
  descriptor: {
    readonly alias?: Iterable<string>
  }
): [Name, ...string[]] => [name, ...descriptor.alias || []]

const fmtAliasList = (alias?: readonly string[]) => alias?.length
  ? ` (alias ${alias.map(flag).join(' ')})`
  : ''

const fmtDescSuffix = (describe?: string) => describe
  ? `:\t${describe}`
  : ''

const fmtTypeHelp = (help?: () => string) => help
  ? '\n' + help()
  : ''

const sharedProps = (
  typeName: string,
  descriptor?: {
    readonly type: ValueExtractor<any, any>
  }
) => ({
  [Symbol.toStringTag]: typeName + (
    descriptor ? `(${descriptor.type[Symbol.toStringTag]})` : ''
  )
})

export const EarlyExitFlag = <Name extends string> (
  name: Name,
  descriptor: EarlyExitDescriptor
): ArgumentExtractor<Name, void> => ({
  name,
  extract (args) {
    const findRes = findFlags(args, listFlags(name, descriptor))
    if (findRes.length) return descriptor.exit()
    return ok({ value: undefined, remainingArgs: args })
  },
  help () {
    const alias = fmtAliasList(descriptor.alias)
    const suffix = fmtDescSuffix(descriptor.describe)
    return `${flag(name)}${alias}${suffix}`
  },
  ...sharedProps('EarlyExitFlag')
})

export interface EarlyExitDescriptor {
  readonly describe?: string
  readonly alias?: readonly string[]
  readonly exit: () => never
}

export const BinaryFlag = <Name extends string> (
  name: Name,
  descriptor: FlagDescriptor = {}
): ArgumentExtractor<Name, boolean> => ({
  name,
  extract (args) {
    const [findRes, remainingArgs] = partitionFlags(args, listFlags(name, descriptor))
    return ok({
      value: Boolean(findRes.length),
      remainingArgs
    })
  },
  help () {
    const alias = fmtAliasList(descriptor.alias)
    const suffix = fmtDescSuffix(descriptor.describe)
    return `${flag(name)}${alias}${suffix}`
  },
  ...sharedProps('BinaryFlag')
})

export { BinaryFlag as Flag }

export const CountFlag = <Name extends string> (
  name: Name,
  descriptor: FlagDescriptor
): ArgumentExtractor<Name, number> => ({
  name,
  extract (args) {
    const [findRes, remainingArgs] = partitionFlags(args, listFlags(name, descriptor))
    return ok({
      value: findRes.length,
      remainingArgs
    })
  },
  help () {
    const alias = fmtAliasList(descriptor.alias)
    const suffix = fmtDescSuffix(descriptor.describe)
    return `${flag(name)}... ${alias}${suffix}`
  },
  ...sharedProps('CountFlag')
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
    const flags = listFlags(name, descriptor)
    const findRes = findFlags(args, flags)
    if (!findRes.length) return err(new MissingFlag(name))
    if (findRes.length !== 1) return err(new ConflictFlags(flags))
    const [res] = findRes
    const valPos = res.index + 1
    if (args.length <= valPos) return err(new MissingValue(res.name!))
    const { isFlag, raw } = args[valPos]
    if (isFlag) return err(new UnexpectedFlag(res.name!, raw))
    const parseResult = descriptor.type.extract([raw])
    if (!parseResult.tag) {
      return err(new ValueParsingFailure(res.name!, parseResult.error))
    }
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
    const typeName = descriptor.type.getTypeName()
    const alias = fmtAliasList(descriptor.alias)
    const suffix = fmtDescSuffix(descriptor.describe)
    const typeHelp = fmtTypeHelp(descriptor.type.help)
    return `${flag(name)} <${typeName}>${alias}${suffix}${typeHelp}`
  },
  ...sharedProps('Option', descriptor)
})

export interface OptionDescriptor<Value> {
  readonly type: ValueExtractor<Value, [string]>
  readonly describe?: string
  readonly alias?: readonly string[]
}
