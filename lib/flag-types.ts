import {
  once
} from './deps.ts'

import {
  FlagType,
  ValueType
} from './types.ts'

import {
  ok,
  err,
  flagPrefix,
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

const fmtTitle = (name: string, descriptor: {
  readonly alias?: Iterable<string>
}): string => listFlags(name, descriptor)
  .map(flagPrefix)
  .join(', ')

const fmtTypeHelp = (help?: () => string) => help
  ? '\n' + help()
  : ''

type FlagHelpFunc = FlagType<any, any>['help']
const FlagHelpFunc = (
  name: string,
  descriptor: {
    readonly alias?: readonly string[]
    readonly describe?: string
  }
): FlagHelpFunc => once(() => ({
  title: fmtTitle(name, descriptor),
  description: descriptor.describe
}))

const sharedProps = (
  typeName: string,
  descriptor?: {
    readonly type: ValueType<any, any>
  }
) => ({
  [Symbol.toStringTag]: typeName + (
    descriptor ? `(${descriptor.type[Symbol.toStringTag]})` : ''
  )
})

export const EarlyExitFlag = <Name extends string> (
  name: Name,
  descriptor: EarlyExitDescriptor
): FlagType<Name, void> => ({
  name,
  extract (args) {
    const findRes = findFlags(args, listFlags(name, descriptor))
    if (findRes.length) return descriptor.exit()
    return ok({ value: undefined, consumedFlags: new Set() })
  },
  help: FlagHelpFunc(name, descriptor),
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
): FlagType<Name, boolean> => ({
  name,
  extract (args) {
    const findRes = findFlags(args, listFlags(name, descriptor))
    return ok({
      value: Boolean(findRes.length),
      consumedFlags: new Set(findRes)
    })
  },
  help: FlagHelpFunc(name, descriptor),
  ...sharedProps('BinaryFlag')
})

export { BinaryFlag as Flag }

export const CountFlag = <Name extends string> (
  name: Name,
  descriptor: FlagDescriptor = {}
): FlagType<Name, number> => ({
  name,
  extract (args) {
    const findRes = findFlags(args, listFlags(name, descriptor))
    return ok({
      value: findRes.length,
      consumedFlags: new Set(findRes)
    })
  },
  help: FlagHelpFunc(name, descriptor),
  ...sharedProps('CountFlag')
})

export interface FlagDescriptor {
  readonly describe?: string
  readonly alias?: readonly string[]
}

export const Option = <Name extends string, Value> (
  name: Name,
  descriptor: OptionDescriptor<Value>
): FlagType<Name, Value> => ({
  name,
  extract (args) {
    const flags = listFlags(name, descriptor)
    const findRes = findFlags(args, flags)
    if (!findRes.length) return err(new MissingFlag(name))
    if (findRes.length !== 1) return err(new ConflictFlags(flags))
    const [res] = findRes
    const valPos = res.index + 1
    if (args.length <= valPos) return err(new MissingValue(res.name))
    const val = args[valPos]
    if (val.type !== 'value') return err(new UnexpectedFlag(res.name, val.raw))
    const parseResult = descriptor.type.extract([val.raw])
    if (!parseResult.tag) {
      return err(new ValueParsingFailure(res.name, parseResult.error))
    }
    return ok({
      value: parseResult.value,
      consumedFlags: new Set([res, val])
    })
  },
  help: once(() => ({
    title: `${fmtTitle(name, descriptor)} <${descriptor.type.getTypeName()}>`,
    description: (descriptor.describe || '') + fmtTypeHelp(descriptor.type.help)
  })),
  ...sharedProps('Option', descriptor)
})

export interface OptionDescriptor<Value> {
  readonly type: ValueType<Value, [string]>
  readonly describe?: string
  readonly alias?: readonly string[]
}
