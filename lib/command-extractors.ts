import {
  ArgvItem,
  ParseResult,
  ParseError,
  ArgumentExtractor
} from './types.ts'

import {
  ok,
  err,
  record
} from './utils.ts'

import {
  MAIN_COMMAND
} from './symbols.ts'

export type CommandReturn<
  Main,
  Name extends string,
  Sub extends CommandReturn<any, any, any>
> = CommandReturn.Main<Main> | CommandReturn.Sub<Name, Sub>

export namespace CommandReturn {
  interface Base<Value> {
    readonly tag: string | MAIN_COMMAND
    readonly value: Value
  }

  export interface Main<Value> extends Base<Value> {
    readonly tag: MAIN_COMMAND
    readonly name?: null
  }

  export interface Sub<
    Name extends string,
    Value extends CommandReturn<any, any, any>
  > extends Base<Value> {
    readonly tag: Name
  }
}

export interface Command<
  Return extends CommandReturn<any, any, any>,
  ErrList extends readonly ParseError[]
> {
  extract (args: readonly ArgvItem[]): ParseResult<Return, ErrList>
}

type BlankReturn = CommandReturn.Main<{}>
const BLANK_PARSE_RESULT = ok<BlankReturn>({
  tag: MAIN_COMMAND,
  value: {}
})
export const BLANK: Command<BlankReturn, []> = ({
  extract: () => BLANK_PARSE_RESULT
})

export type FlaggedCommandReturn<
  MainVal,
  Name extends string,
  Value
> = CommandReturn.Main<MainVal & Record<Name, Value>>
export const FlaggedCommand = <
  MainVal,
  Name extends string,
  Value
> (
  main: Command<CommandReturn.Main<MainVal>, readonly ParseError[]>,
  extractor: ArgumentExtractor<Name, Value>
): Command<
  FlaggedCommandReturn<MainVal, Name, Value>,
  readonly ParseError[]
> => ({
  extract (args): ParseResult<FlaggedCommandReturn<MainVal, Name, Value>, readonly ParseError[]> {
    const prevResult = main.extract(args)
    if (!prevResult.tag) return prevResult
    const nextResult = extractor.extract(args)
    if (!nextResult.tag) return err([nextResult.error])
    const value = {
      ...prevResult.value.value,
      ...record(extractor.name, nextResult.value.value)
    }
    return ok<FlaggedCommandReturn<MainVal, Name, Value>>({
      tag: MAIN_COMMAND,
      value
    })
  }
})

export type SubCommandReturn<
  Main extends CommandReturn<any, any, any>,
  Name extends string,
  SubVal extends CommandReturn<any, any, any>
> = Main | CommandReturn.Sub<Name, SubVal>
export const SubCommand = <
  Main extends CommandReturn<any, any, any>,
  Name extends string,
  SubVal extends CommandReturn<any, any, any>,
  ErrList extends readonly ParseError[]
> (
  main: Command<Main, ErrList>,
  name: Name,
  sub: Command<SubVal, ErrList>
): Command<
  SubCommandReturn<Main, Name, SubVal>,
  ErrList
> => ({
  extract (args): ParseResult<SubCommandReturn<Main, Name, SubVal>, ErrList> {
    if (args.length === 0) return main.extract(args)
    const [first, ...rest] = args
    if (first.isFlag || first.raw !== name) return main.extract(args)
    const result = sub.extract(rest)
    if (!result.tag) return result
    return ok({
      tag: name,
      value: result.value
    })
  }
})
