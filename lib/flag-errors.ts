import {
  ParseError
} from './types.ts'

import {
  flag
} from './utils.ts'

const fmtFlagList = (names: readonly string[]) => names.map(flag).join(' ')

abstract class FlagError implements ParseError {
  public abstract toString (): string
}

export class UnknownFlags extends FlagError {
  constructor (
    public readonly names: readonly string[]
  ) {
    super()
  }

  public toString () {
    return `Unknown flags: ${fmtFlagList(this.names)}`
  }
}

export class MissingFlag extends FlagError {
  constructor (
    public readonly name: string
  ) {
    super()
  }

  public toString () {
    return `Flag ${flag(this.name)} is required but missing`
  }
}

export class ConflictFlags extends FlagError {
  constructor (
    public readonly names: readonly string[]
  ) {
    super()
  }

  public toString () {
    return `Conflicting options: ${fmtFlagList(this.names)}`
  }
}

export class MissingValue extends FlagError {
  constructor (
    public readonly name: string
  ) {
    super()
  }

  public toString () {
    return `Option ${flag(this.name)} requires a value but none was found`
  }
}

export class UnexpectedFlag extends FlagError {
  constructor (
    public readonly name: string,
    public readonly unexpectedFlag: string
  ) {
    super()
  }

  public toString () {
    return `Option ${flag(this.name)} requires a value but received flag ${flag(this.unexpectedFlag)} instead`
  }
}

export class ValueParsingFailure extends FlagError {
  constructor (
    public readonly name: string,
    public readonly error: ParseError
  ) {
    super()
  }

  public toString () {
    return `Failed to parse ${this.name}: ${this.error.toString()}`
  }
}
