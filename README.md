# Deno Args

CLI arguments parser for [Deno](https://deno.land) with TypeScript inference.

## Usage

```typescript
import build from 'https://deno.land/x/args/build.ts'
import help from 'https://deno.land/x/args/help.ts'
import { Flag, Option } from 'https://deno.land/x/args/extractors.ts'
import { Number, Choice } from 'https://deno.land/x/args/types.ts'

const parser = build()
  .with(Flag('help', {
    alias: ['h'],
    describe: 'Show help'
  }))
  .with(Option('a', {
    type: Number,
    describe: 'Value of a'
  }))
  .with(Option('b', {
    type: Number,
    describe: 'Value of b'
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
