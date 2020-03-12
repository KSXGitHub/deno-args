import {
  ParseError
} from './types.ts'

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
    return `Unknown options: ${this.names.join(', ')}`
  }
}

export class MissingFlag extends ErrorBase {
  constructor (
    public readonly name: string
  ) {
    super()
  }

  public toString () {
    return `Option ${this.name} is required but missing`
  }
}

export class ConflictFlags extends ErrorBase {
  constructor (
    public readonly names: readonly string[]
  ) {
    super()
  }

  public toString () {
    return `Conflicting options: ${this.names.join(', ')}`
  }
}
