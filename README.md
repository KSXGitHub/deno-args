# Deno Args

Extensible CLI arguments parser for [Deno](https://deno.land) with intelligent TypeScript inference.

**⚠ Warning:** This project is in an early stage of development. Things may break without notice. Be sure to specify exact version when use.

## TODO

* [x] Report multiple errors at the same time
* [ ] Improve help
  * [x] Implement as `EarlyExit`
  * [ ] Support both flag and subcommand (`--help` and `help`)
  * [ ] Proper indentation
  * [ ] Categories
  * Reference [clap](https://clap.rs/)'s
* [ ] Negative numbers
* [ ] TSDoc
* [ ] Support subcommands
* [ ] Release for Node.js
* [ ] Test
* [ ] Type test
  * [ ] Make sure TypeScript infer the right type
* [ ] When all is done, remove warning

## Usage Examples

```typescript
import build from 'https://deno.land/x/args/build.ts'
import { HelpFlag, Option } from 'https://deno.land/x/args/flags.ts'
import { FiniteNumber, Choice } from 'https://deno.land/x/args/values.ts'

const parser = build()
  .with(EarlyExitFlag('help', {
    describe: 'Show help',
    exit () {
      console.log(parser.help())
      return Deno.exit()
    }
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
  for (const e of res.error) {
    console.error(e.toString)
  }
  Deno.exit(1)
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

### More Examples

Go to [preview folder](https://github.com/KSXGitHub/deno-args/tree/master/preview) for more examples.

## License

[MIT](https://git.io/JvK1f) © [Hoàng Văn Khải](https://github.com/KSXGitHub)
