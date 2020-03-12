import {
  ParseError
} from './types.ts'

import {
  flag
} from './utils.ts'

const fmtFlagList = (names: readonly string[]) => names.map(flag).join(' ')

abstract class ErrorBase implements ParseError {
  public abstract toString (): string
}

export class UnknownFlags extends ErrorBase {
  constructor (
    public readonly names: readonly string[]
  ) {
    super()
  }

  public toString () {
    return `Unknown flags: ${fmtFlagList(this.names)}`
  }
}

export class MissingFlag extends ErrorBase {
  constructor (
    public readonly name: string
  ) {
    super()
  }

  public toString () {
    return `Flag ${flag(this.name)} is required but missing`
  }
}

export class ConflictFlags extends ErrorBase {
  constructor (
    public readonly names: readonly string[]
  ) {
    super()
  }

  public toString () {
    return `Conflicting options: ${fmtFlagList(this.names)}`
  }
}

export class MissingValue extends ErrorBase {
  constructor (
    public readonly name: string
  ) {
    super()
  }

  public toString () {
    return `Option ${flag(this.name)} requires a value but none was found`
  }
}

export class UnexpectedFlag extends ErrorBase {
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

// TODO: Distinguish flag error and value error

export class NotANumber extends ErrorBase {
  constructor (
    public readonly raw: string
  ) {
    super()
  }

  public toString () {
    return `Not a number: ${this.raw}`
  }
}

export class NotAnInteger extends ErrorBase {
  constructor (
    public readonly raw: string,
    public readonly error: SyntaxError
  ) {
    super()
  }

  public toString () {
    return `Not an integer: ${this.raw} (${this.error})`
  }
}
