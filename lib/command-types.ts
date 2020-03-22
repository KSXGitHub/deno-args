import {
  once
} from './deps.ts'

import {
  ArgvItem,
  ParseError,
  FlagType
} from './types.ts'

import {
  record
} from './utils.ts'

import {
  MAIN_COMMAND,
  PARSE_FAILURE
} from './symbols.ts'

import {
  CommandError
} from './command-errors.ts'

export type CommandReturn<
  MainVal,
  Name extends string,
  Sub extends CommandReturn<any, any, any>
> = CommandReturn.Main<MainVal> | CommandReturn.Sub<Name, Sub>

export type ParseFailure<
  ErrList extends readonly ParseError[]
> = CommandReturn.Failure<ErrList>

export const ParseFailure = <
  ErrList extends readonly ParseError[]
> (error: ErrList): ParseFailure<ErrList> => ({
  tag: PARSE_FAILURE,
  error: new CommandError(error)
})

export namespace CommandReturn {
  interface Base {
    readonly tag: string | MAIN_COMMAND | PARSE_FAILURE
    readonly value?: unknown
    readonly error?: null | CommandError<any>
  }

  interface SuccessBase<Value> extends Base, ExtraProps {
    readonly tag: string | MAIN_COMMAND
    readonly value: Value
    readonly error?: null
    readonly consumedArgs: ReadonlySet<ArgvItem>
  }

  export interface Main<Value> extends SuccessBase<Value> {
    readonly tag: MAIN_COMMAND
  }

  export interface Sub<
    Name extends string,
    Value extends CommandReturn<any, any, any>
  > extends SuccessBase<Value> {
    readonly tag: Name
  }

  interface FailureBase<
    ErrList extends readonly ParseError[]
  > extends Base {
    readonly tag: PARSE_FAILURE
    readonly error: CommandError<ErrList>
    readonly value?: null
  }

  export interface Failure<ErrList extends readonly ParseError[]>
  extends FailureBase<ErrList> {}
}

export interface Command<
  Return extends CommandReturn<any, any, any>,
  ErrList extends readonly ParseError[]
> {
  extract (args: readonly ArgvItem[]): Return | ParseFailure<ErrList>
  describe (): Iterable<string>
  help (): Iterable<CommandHelp>
}

export interface CommandHelp {
  readonly category: string
  readonly title: string
  readonly description?: string
}

type BlankReturn = CommandReturn.Main<{}>
export const BLANK: Command<BlankReturn, never> = ({
  extract: (args) => addExtraProps({
    tag: MAIN_COMMAND,
    value: {},
    consumedArgs: new Set<never>()
  } as const, args),
  describe: () => [],
  help: () => []
})

export type FlaggedCommandReturn<
  MainVal,
  NextKey extends string,
  NextVal
> = CommandReturn.Main<MainVal & Record<NextKey, NextVal>>
type FlaggedCommandExtract<
  MainVal,
  NextKey extends string,
  NextVal,
  ErrList extends readonly ParseError[]
> = FlaggedCommandReturn<MainVal, NextKey, NextVal> | ParseFailure<ErrList | readonly [ParseError]>
export const FlaggedCommand = <
  MainVal,
  NextKey extends string,
  NextVal,
  ErrList extends readonly ParseError[]
> (
  main: Command<CommandReturn.Main<MainVal>, ErrList>,
  extractor: FlagType<NextKey, NextVal>
): Command<FlaggedCommandReturn<MainVal, NextKey, NextVal>, ErrList | readonly [ParseError]> => ({
  extract (args): FlaggedCommandExtract<MainVal, NextKey, NextVal, ErrList> {
    const prevResult = main.extract(args)
    if (prevResult.tag === PARSE_FAILURE) return prevResult
    const nextResult = extractor.extract(args)
    if (!nextResult.tag) return ParseFailure([nextResult.error])
    const value = {
      ...prevResult.value,
      ...record(extractor.name, nextResult.value.value)
    }
    const consumedArgs = new Set([
      ...prevResult.consumedArgs,
      ...nextResult.value.consumedFlags
    ])
    return addExtraProps({
      tag: MAIN_COMMAND,
      value,
      consumedArgs
    } as const, args)
  },
  describe: () => main.describe(),
  * help (): Iterable<CommandHelp> {
    yield * main.help()
    yield {
      category: 'OPTIONS',
      ...extractor.help()
    }
  }
})

export type SubCommandReturn<
  Main extends CommandReturn<any, any, any>,
  Name extends string,
  Sub extends CommandReturn<any, any, any>
> = Main | CommandReturn.Sub<Name, Sub>
export const SubCommand = <
  Main extends CommandReturn<any, any, any>,
  Name extends string,
  Sub extends CommandReturn<any, any, any>,
  ErrList extends readonly ParseError[]
> (
  main: Command<Main, ErrList>,
  name: Name,
  sub: Command<Sub, ErrList>
): Command<SubCommandReturn<Main, Name, Sub>, ErrList> => ({
  extract (args): SubCommandReturn<Main, Name, Sub> | ParseFailure<ErrList> {
    if (args.length === 0) return main.extract(args)
    const [first, ...rest] = args
    if (first.type !== 'value' || first.raw !== name) return main.extract(args)
    const result = sub.extract(rest.map((item, index) => ({ ...item, index })))
    if (result.tag === PARSE_FAILURE) return result as ParseFailure<ErrList>
    const value = result as Sub
    const consumedArgs = new Set([first, ...value.consumedArgs])
    return addExtraProps({
      tag: name,
      consumedArgs,
      value
    } as const, args) as CommandReturn.Sub<Name, Sub>
  },
  describe: () => main.describe(),
  * help (): Iterable<CommandHelp> {
    yield * main.help()
    yield {
      category: 'SUBCOMMANDS',
      title: name,
      description: undefined! // TODO: implement
    }
  }
})

interface ExtraProps {
  remaining (): {
    rawFlags (): readonly string[]
    rawValues (): readonly string[]
    rawArgs (): readonly string[]
  }
  readonly _: readonly string[]
}

function addExtraProps<Main extends {
  readonly consumedArgs: ReadonlySet<ArgvItem>
}> (main: Main, args: readonly ArgvItem[]): Main & ExtraProps {
  const remaining: ExtraProps['remaining'] = once(() => {
    const { consumedArgs } = object
    const remainingArgs = args.filter(item => !consumedArgs.has(item))
    const mapFn = (item: ArgvItem) => item.raw
    const rawArgs = once(() => remainingArgs.map(mapFn))
    const rawFlags = once(
      () => remainingArgs
        .filter(item => item.type !== 'value')
        .map(mapFn)
    )
    const rawValues = once(
      () => remainingArgs
        .filter(item => item.type === 'value')
        .map(mapFn)
    )
    return {
      rawArgs,
      rawFlags,
      rawValues
    }
  })
  const object: Main & ExtraProps = {
    get _ () {
      return this.remaining().rawArgs()
    },
    remaining,
    ...main
  }
  return object
}
