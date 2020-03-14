import {
  ValueExtractor
} from './types.ts'

import {
  ok,
  err
} from './utils.ts'

import {
  NotANumber,
  NotAnInteger,
  InvalidChoice
} from './value-errors.ts'

const sharedProps = (typeName: string) => ({
  [Symbol.toStringTag]: typeName
})

export const Text: ValueExtractor<string, readonly [string]> = {
  extract: ([raw]) => ok(raw),
  getTypeName: () => 'text',
  ...sharedProps('Text')
}

export const FiniteNumber: ValueExtractor<number, readonly [string]> = {
  extract ([raw]) {
    const value = Number(raw)
    return isFinite(value)
      ? ok(value)
      : err(new NotANumber(raw))
  },
  getTypeName: () => 'number',
  ...sharedProps('FiniteNumber')
}

export const Integer: ValueExtractor<BigInt, readonly [string]> = {
  extract ([raw]) {
    try {
      return ok(BigInt(raw))
    } catch (error) {
      return err(new NotAnInteger(raw, error))
    }
  },
  getTypeName: () => 'integer',
  ...sharedProps('Integer')
}

export function Choice<
  Value extends number | string
> (...choices: {
  readonly value: Value
  readonly describe?: string
}[]): ValueExtractor<Value, readonly [string]> {
  const values = choices.map(x => x.value)
  const valueStrings = values.map(x => String(x))

  { // check for duplication
    const duplications = valueStrings.filter((x, i) => valueStrings.indexOf(x) !== i)
    if (duplications.length) throw new RangeError(`Duplicated choices: ${duplications.join(' ')}`)
  }

  { // check for invalid numbers
    const invalidNumbers = values.filter(x => typeof x === 'number' && !isFinite(x))
    if (invalidNumbers.length) throw new RangeError(`Invalid numbers: ${invalidNumbers.join(' ')}`)
  }

  return {
    extract ([raw]) {
      for (const value of values) {
        if (value === raw || value === Number(raw)) return ok(value)
      }
      return err(new InvalidChoice(raw, values))
    },
    getTypeName: () => valueStrings.map(x => JSON.stringify(x)).join('|'),
    help () {
      let text = ''
      for (const { value, describe } of choices) {
        if (describe) text += `${value}: ${describe}\n`
      }
      return text
    },
    ...sharedProps(`Choice(${values.join(',')})`)
  }
}
