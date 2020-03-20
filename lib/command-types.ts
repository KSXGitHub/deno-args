import {
  ArgvItem,
  Result,
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

export type CommandReturn<
  Main,
  Name extends string,
  Sub extends CommandReturn<any, any, any>
> = CommandReturn.Main<Main> | CommandReturn.Sub<Name, Sub>

export type ParseFailure<
  ErrList extends readonly ParseError[]
> = CommandReturn.Failure<ErrList>

export const ParseFailure = <
  ErrList extends readonly ParseError[]
> (error: ErrList): ParseFailure<ErrList> => ({
  tag: PARSE_FAILURE,
  error
})

export namespace CommandReturn {
  interface Base {
    readonly tag: string | MAIN_COMMAND | PARSE_FAILURE
    readonly value?: unknown
    readonly error?: null | readonly ParseError[]
  }

  interface SuccessBase<Value> extends Base {
    readonly tag: string | MAIN_COMMAND
    readonly value: Value
    readonly error?: null
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
    readonly error: ErrList
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
}

type BlankReturn = CommandReturn.Main<{}>
const BLANK_PARSE_RESULT: BlankReturn = {
  tag: MAIN_COMMAND,
  value: {}
}
export const BLANK: Command<BlankReturn, never> = ({
  extract: () => BLANK_PARSE_RESULT
})

export type FlaggedCommandReturn<
  Main,
  Name extends string,
  Value
> = CommandReturn.Main<Main & Record<Name, Value>>
type FlaggedCommandExtract<
  Main,
  Name extends string,
  Value,
  ErrList extends readonly ParseError[]
> = FlaggedCommandReturn<Main, Name, Value> | ParseFailure<ErrList | readonly [ParseError]>
export const FlaggedCommand = <
  Main,
  Name extends string,
  Value,
  ErrList extends readonly ParseError[]
> (
  main: Command<CommandReturn.Main<Main>, ErrList>,
  extractor: FlagType<Name, Value>
): Command<FlaggedCommandReturn<Main, Name, Value>, ErrList | readonly [ParseError]> => ({
  extract (args): FlaggedCommandExtract<Main, Name, Value, ErrList> {
    const prevResult = main.extract(args)
    if (prevResult.tag === PARSE_FAILURE) return prevResult
    const nextResult = extractor.extract(args)
    if (!nextResult.tag) return ParseFailure([nextResult.error])
    const value = {
      ...prevResult.value,
      ...record(extractor.name, nextResult.value.value)
    }
    return {
      tag: MAIN_COMMAND,
      value
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
    return {
      tag: name,
      value: result as Sub
    } as CommandReturn.Sub<Name, Sub>
  }
})
