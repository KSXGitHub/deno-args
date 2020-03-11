export interface ArgumentExtractor<Name extends string, Value> {
  readonly name: Name
  readonly extract: (args: ArgvItem[]) => ParseResult<{
    value: Value
    remainingArgs: ArgvItem[]
  }>
}

export interface ValueExtractor<Value, Raw extends readonly string[]> {
  (raw: Raw): ParseResult<Value>
}

export type ParseResult<Value> = ParseSuccess<Value> | ParseFailure

export interface ParseSuccess<Value> {
  readonly tag: true
  readonly value: Value
  readonly error?: null
}

export interface ParseFailure {
  readonly tag: false
  readonly value?: null
  readonly error: ParseError
}

export interface ParseError {
  toString (): string
}

export interface ArgvItem {
  readonly isFlag: boolean
  readonly value: string
}
