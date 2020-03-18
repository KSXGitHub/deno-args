import {
  ArgvItem,
  ParseResult,
  ParseError,
  ArgumentExtractor
} from './types.ts'

import {
  ok
} from './utils.ts'

type CommandReturn<
  Main,
  Name extends string,
  Sub extends CommandReturn<any, any, any>
> = CommandReturn.Main<Main> | CommandReturn.Sub<Name, Sub>

namespace CommandReturn {
  interface Base<Value> {
    readonly sub: string | false
    readonly value: Value
  }

  export interface Main<Value> extends Base<Value> {
    readonly sub: false
    readonly name?: null
  }

  export interface Sub<
    Name extends string,
    Value extends CommandReturn<any, any, any>
  > extends Base<Value> {
    readonly sub: Name
  }
}

export interface Command<
  Return extends CommandReturn<any, any, any>,
  ErrList extends readonly ParseError[]
> {
  extract (args: readonly ArgvItem[]): ParseResult<Return, ErrList>
}

type MainCommandReturn<Name extends string, Value> = CommandReturn.Main<Record<Name, Value>>

export const MainCommand = <Name extends string, Value> (
  extractor: ArgumentExtractor<Name, Value>
): Command<
  MainCommandReturn<Name, Value>,
  readonly ParseError[]
> => ({})

type SubCommandReturn<
  Main extends CommandReturn.Main<any>,
  Name extends string,
  SubVal extends CommandReturn<any, any, any>
> = Main | CommandReturn.Sub<Name, SubVal>

export const SubCommand = <
  Main extends CommandReturn.Main<any>,
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
      sub: name,
      value: result.value
    })
  }
})
