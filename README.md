# Deno Args

[![Travis Build Status](https://travis-ci.org/KSXGitHub/deno-args.svg?branch=master)](https://travis-ci.org/KSXGitHub/deno-args)

Extensible CLI arguments parser for [Deno](https://deno.land) with intelligent TypeScript inference.

## Usage Examples

```typescript
import args from "https://deno.land/x/args@1.0.5/wrapper.ts";
import {
  EarlyExitFlag,
  Option,
} from "https://deno.land/x/args@1.0.5/flag-types.ts";
import {
  FiniteNumber,
  Choice,
} from "https://deno.land/x/args@1.0.5/value-types.ts";

const parser = args
  .with(
    EarlyExitFlag("help", {
      describe: "Show help",
      exit() {
        console.log(parser.help());
        return Deno.exit();
      },
    })
  )
  .with(
    Option("a", {
      type: FiniteNumber,
      describe: "Value of a",
    })
  )
  .with(
    Option("b", {
      type: FiniteNumber,
      describe: "Value of b",
    })
  )
  .with(
    Option("operator", {
      type: Choice<"add" | "sub">(
        {
          value: "add",
          describe: "Add two numbers",
        },
        {
          value: "sub",
          describe: "Subtract two numbers",
        }
      ),
      alias: ["o"],
      describe: "Operator to use",
    })
  );

const res = parser.parse(Deno.args);

if (res.error) {
  console.error("Failed to parse CLI arguments");
  for (const e of res.error) {
    console.error(e.toString);
  }
  Deno.exit(1);
} else {
  const { a, b, operator } = res.value;
  switch (operator) {
    case "add":
      console.log(a + b);
    case "sub":
      console.log(a - b);
  }
}
```

## Sample Apps

- https://github.com/KSXGitHub/deno_run_tests_on_localhost/blob/master/cli.ts

## Become a Patron

[My Patreon Page](https://patreon.com/khai96_).

## Development

All tasks are in [Drakefile.ts](https://git.io/JvhVf).

### Run all tests

```sh
deno -A Drakefile.ts all
```

### Fix files

```sh
env UPDATE=true deno -A Drakefile.ts all
```

## License

[MIT](https://git.io/JvK1f) © [Hoàng Văn Khải](https://github.com/KSXGitHub)
