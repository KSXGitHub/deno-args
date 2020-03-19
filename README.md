# Deno Args

Extensible CLI arguments parser for [Deno](https://deno.land) with intelligent TypeScript inference.

**⚠ Warning:** This project is in an early stage of development. Things may break without notice. Be sure to specify exact version when use.

## TODO

* [x] Report multiple errors at the same time
* [ ] Re-design: Re-implement
  * [ ] --help
  * [ ] `Deno.symbols.customInspect`
* [ ] Improve help
  * [x] Implement as `EarlyExit`
  * [ ] Support both flag and subcommand (`--help` and `help`)
  * [ ] Proper indentation
  * [ ] Categories
  * Reference [clap](https://clap.rs/)'s
* [x] Negative numbers
* [ ] Optional flags
* [ ] TSDoc
* [ ] Support subcommands
  * [ ] Known subcommands (subcommands that are known and defined by the programmer)
  * [ ] Unknown subcommands (e.g. `git foo` will find `git-foo` and execute it)
* [ ] Release for Node.js
  * [ ] Compile TypeScript files to JavaScript
  * [ ] Create both CommonJS and ESM modules
  * [ ] May use `parcel`
* [ ] Add CI
  * [ ] GitHub actions
  * [ ] Travis CI
  * [ ] Deploy on Netlify, now.sh, surge.sh
* [ ] Test
  * [ ] Use `jest` (Deno test ecosystem is yet matured)
* [ ] Use `prettier` to format
* [ ] Type test
  * [ ] Make sure TypeScript infer the right type
* [ ] Re-structure
  * [ ] Create sub-directories for `{argument,value}-{errors,extractors}` and `utils`
  * [ ] Convert import URLs to point to original files when sub-directories are created
* [ ] When all is done, remove warning

## Usage Examples

```typescript
import args from 'https://deno.land/x/args/args.ts'
import { HelpFlag, Option } from 'https://deno.land/x/args/argument-extractors.ts'
import { FiniteNumber, Choice } from 'https://deno.land/x/args/value-extractors.ts'

const parser = args
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
