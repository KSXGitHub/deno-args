# Deno Args

CLI arguments parser for [Deno](https://deno.land), inspired by [yargs](https://yargs.js.org).

## Usage

```typescript
import build from 'https://deno.land/x/args/build.ts'
import { Boolean, Number, Choice } from 'https://deno.land/x/args/presets.ts'
import help from 'https://deno.land/x/args/help.ts'

const parser = build()
  .option({
    name: 'help',
    describe: 'Show help',
    type: Boolean
  })
  .option({
    name: 'a',
    describe: 'Value of a',
    type: Number
  })
  .option({
    name: 'b',
    describe: 'Value of b',
    type: Number
  })
  .option({
    name: 'operator',
    describe: 'Operator',
    type: Choice([
      {
        value: 'add',
        describe: 'Calculate a + b'
      },
      {
        value: 'sub',
        describe: 'Calculate a - b'
      }
    ])
  })

const res = parser.parse(Deno.args)

if (res.error) {
  console.error('Failed to parse CLI arguments')
  console.error(res.error)
  Deno.exit(1)
} else if (res.options.help) {
  console.log(help(args))
} else {
  const { a, b, operator } = res.options
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
