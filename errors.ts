import {
  ParseError
} from './types.ts'

abstract class ErrorBase implements ParseError {
  public abstract toString (): string
}

export class UnknownFlags extends ErrorBase {
  constructor (
    public readonly options: readonly string[]
  ) {
    super()
  }

  public toString () {
    return `Unknown options: ${this.options.join(', ')}`
  }
}

export class MissingFlag extends ErrorBase {
  constructor (
    public readonly optionName: string
  ) {
    super()
  }

  public toString () {
    return `Option ${this.optionName} is required but missing`
  }
}

export class ConflictFlags extends ErrorBase {
  constructor (
    public readonly options: readonly string[]
  ) {
    super()
  }

  public toString () {
    return `Conflicting options: ${this.options.join(', ')}`
  }
}
