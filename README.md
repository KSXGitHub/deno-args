# Deno Args

Extensible CLI arguments parser for [Deno](https://deno.land) with intelligent TypeScript inference.

**⚠ Warning:** This project is in an early stage of development. Things may break without notice. Be sure to specify exact version when use.

## Usage Examples

```typescript
import args from 'https://deno.land/x/args/wrapper.ts'
import { HelpFlag, Option } from 'https://deno.land/x/args/argument-types.ts'
import { FiniteNumber, Choice } from 'https://deno.land/x/args/value-types.ts'

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

## TODO

* [x] Report multiple errors at the same time
* [ ] Improve help
  * [x] Implement as `EarlyExit`
  * [ ] Support both flag and subcommand (`--help` and `help`)
  * [x] Help for subcommand: (`prog cmd --help` and `prog help cmd`)
  * [x] Proper indentation
  * [x] Categories
  * Reference [clap](https://clap.rs/)'s
* [ ] Use a task runner
* [x] Negative numbers
* [x] Optional flags
* [ ] Sharing flags between subcommands
* [x] `index.ts`
* [ ] `manual.md`
* [ ] Integration with `@tsfun/pipe`
  * Use [Pika CDN](https://cdn.pika.dev), [JSPM](https://jspm.io) does not support TypeScript header.
  * [ ] Update `preview/parser.ts`
  * [ ] Update example in `README.md`
* [ ] TSDoc
  * [x] Describe all public APIs
  * [ ] Add examples to `flag-types.ts`
  * [ ] Add examples to `wrapper.ts`
* [ ] Support subcommands
  * [x] Known subcommands (subcommands that are known and defined by the programmer)
  * [ ] Unknown subcommands (e.g. `git foo` will find `git-foo` and execute it)
* [ ] ~~Release for Node.js~~ _(Blocker: https://github.com/denoland/deno/issues/4538, https://github.com/denoland/deno/issues/4539, https://github.com/denoland/deno/issues/4542)_
* [ ] Add CI
  * [ ] GitHub actions
  * [ ] Travis CI
* [x] Test
  * [ ] ~~Use `jest` (Deno test ecosystem is yet matured)~~ _(Blocker: https://github.com/denoland/deno/issues/4538, https://github.com/denoland/deno/issues/4539, https://github.com/denoland/deno/issues/4542)_
  * [ ] ~~Use `jest` to snapshot `preview`~~ _(No needs)_
  * [x] Use `deno test` to make some assertions
* [ ] Use `prettier` to format
* [x] Type test
* [ ] When all is done, remove warning

## License

[MIT](https://git.io/JvK1f) © [Hoàng Văn Khải](https://github.com/KSXGitHub)
