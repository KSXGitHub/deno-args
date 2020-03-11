export interface Extractor<Name extends string, Value> {
  readonly name: Name
  readonly extract: (args: ArgvItem[]) => ParseResult<{
    value: Value
    remainingArgs: ArgvItem[]
  }>
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
  readonly error: {
    toString (): string
  }
}

export interface ArgvItem {
  readonly isFlag: boolean
  readonly value: string
}
