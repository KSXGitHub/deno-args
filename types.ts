export interface ArgumentExtractor<Name extends string, Value> {
  readonly name: Name
  extract (args: ArgvItem[]): ParseResult<{
    value: Value
    remainingArgs: ArgvItem[]
  }>
  help (): string
}

export interface ValueExtractor<Value, Raw extends readonly string[]> {
  extract (raw: Raw): ParseResult<Value>
  help (): string
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
