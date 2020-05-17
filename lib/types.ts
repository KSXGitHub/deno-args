import { FlagError } from './flag-errors.ts'
import { ValueError } from './value-errors.ts'

/**
 * Interface of a flag type
 * @template Name Type of flag's name, preferably literal
 * @template Value Type of flag's value
 */
export interface FlagType<Name extends string, Value> {
  /** Flag name */
  readonly name: Name

  /**
   * Extract value from a list of arguments
   * @param args List of arguments
   * @returns `Ok(result)` if succeed, `Err(error)` otherwise
   */
  extract(args: readonly ArgvItem[]): Result<{
    value: Value
    consumedFlags: ReadonlySet<ArgvItem>
  }, FlagError>

  /**
   * Create a `FlagHelp` to display in `help::help()` or `wrapper::help()`
   * @returns Instance of `FlagHelp`
   */
  help(): FlagHelp

  /** Class name */
  readonly [Symbol.toStringTag]: string
}

/**
 * Interface of a help item
 */
export interface FlagHelp {
  /** Item title */
  readonly title: string
  /** Item description */
  readonly description?: string
}

/**
 * Interface of a value type
 * @template Value Type of value (output)
 * @template Raw Type of argument tuple (input)
 */
export interface ValueType<Value, Raw extends readonly string[]> {
  /**
   * Convert an array of raw arguments to value of the type
   * @param raw Raw arguments to parse
   * @returns `Ok(result)` if succeed, `Err(error)` otherwise
   */
  extract(raw: Raw): Result<Value, ValueError>

  /**
   * Type name to display in `console.log`
   * @returns Type name
   */
  getTypeName(): string

  /**
   * Extra help messages
   * @returns Help messages
   */
  help?(): string

  /** Class name */
  readonly [Symbol.toStringTag]: string
}

/**
 * Type of result of a function that may fail
 * @template Value Type of value when the function succeeds
 * @template Error Type of error when the function fails
 */
export type Result<Value, Error extends ParseError> = Ok<Value> | Err<Error>

/**
 * Success variant of {@link Result}
 * @template Value Type of value
 */
export interface Ok<Value> {
  /** Discriminant */
  readonly tag: true
  /** Value */
  readonly value: Value
  /** Error */
  readonly error?: null
}

/**
 * Failure variant of {@link Result}
 * @template Error Type of error
 */
export interface Err<Error extends ParseError> {
  /** Discriminant */
  readonly tag: false
  /** Value */
  readonly value?: null
  /** Error */
  readonly error: Error
}

/**
 * Basic interface of an error
 */
export interface ParseError {
  /**
   * Get readable error message
   * @returns Error message
   */
  toString(): string
}

/**
 * Type of a classified argument
 */
export type ArgvItem =
  | ArgvItem.SingleFlag
  | ArgvItem.MultiFlag
  | ArgvItem.DoubleDash
  | ArgvItem.Value

export namespace ArgvItem {
  interface Base {
    /** Position of the item in the arguments array */
    readonly index: number
    /** Discriminant and type of argument */
    readonly type: 'single-flag' | 'multi-flag' | 'double-dash' | 'value'
    /** Raw argument from which it was parsed */
    readonly raw: string
    /** Flag name if the argument is a flag */
    readonly name?: string | readonly string[] | null
  }

  /**
   * Single flag variant of {@link ArgvItem}
   */
  export interface SingleFlag extends Base {
    readonly type: 'single-flag'
    readonly name: string
  }

  /**
   * Multiple flag variant of {@link ArgvItem}
   */
  export interface MultiFlag extends Base {
    readonly type: 'multi-flag'
    readonly name: readonly string[]
  }

  /**
   * Double dash variant of {@link ArgvItem}
   */
  export interface DoubleDash extends Base {
    readonly type: 'double-dash'
    readonly raw: '--'
  }

  /**
   * Value variant of {@link ArgvItem}
   */
  export interface Value extends Base {
    readonly type: 'value'
    readonly name?: null
  }
}
