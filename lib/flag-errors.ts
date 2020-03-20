import {
  ParseError
} from './types.ts'

import {
  flag
} from './utils.ts'

import {
  ValueError
} from './value-errors.ts'

const fmtFlagList = (names: readonly string[]) => names.map(flag).join(' ')

export abstract class FlagError implements ParseError {
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
    public readonly name: string | readonly string[]
  ) {
    super()
  }

  public toString () {
    return `Option ${flag(this.name)} requires a value but none was found`
  }
}

export class UnexpectedFlag extends FlagError {
  constructor (
    public readonly name: string | readonly string[],
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
    public readonly name: string | readonly string[],
    public readonly error: ValueError
  ) {
    super()
  }

  public toString () {
    return `Failed to parse ${flag(this.name)}: ${this.error.toString()}`
  }
}
