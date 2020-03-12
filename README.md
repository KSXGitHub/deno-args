# Deno Args

CLI arguments parser for [Deno](https://deno.land) with TypeScript inference.

## Usage

```typescript
import build from 'https://deno.land/x/args/build.ts'
import help from 'https://deno.land/x/args/help.ts'
import { Flag, Option } from 'https://deno.land/x/args/flags.ts'
import { FiniteNumber, Choice } from 'https://deno.land/x/args/values.ts'

const parser = build()
  .with(Flag('help', {
    alias: ['h'],
    describe: 'Show help'
  }))
  .with(Option('a', {
    type: FiniteNumber,
    describe: 'Value of a'
  }))
  .with(Option('b', {
    type: FiniteNumber,
    describe: 'Value of b'
  }))
  .with(Option('operator', {
    type: Choice<'add' | 'sub'>(
      {
        value: 'add',
        describe: 'Add two numbers'
      },
      {
        value: 'sub',
        describe: 'Subtract two numbers'
      }
    ),
    alias: ['o'],
    describe: 'Operator to use'
  }))

const res = parser.parse(Deno.args)

if (res.error) {
  console.error('Failed to parse CLI arguments')
  console.error(res.error)
  Deno.exit(1)
} else if (res.value.help) {
  console.log(help(args))
} else {
  const { a, b, operator } = res.value
  switch (operator) {
    case 'add':
      console.log(a + b)
    case 'sub':
      console.log(a - b)
  }
}
```

## License

[MIT](https://git.io/JvK1f) © [Hoàng Văn Khải](https://github.com/KSXGitHub)
