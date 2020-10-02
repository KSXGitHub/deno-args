# Examples

The following is CLI usages of the example code.

## [`options.ts`](./options.ts)

### `--help`

```sh
deno run options.ts --help
```

### `--operator add`

```sh
deno run options.ts --operator add -a 12 -b 34
```

_Output:_ 46

### `--operator sub`

```sh
deno run options.ts --operator sub -a 12 -b 34
```

_Output:_ -22

## [`sub.ts`](./sub.ts)

### `help`

```sh
deno run sub.ts help
```

```sh
deno run sub.ts help multiply
```

```sh
deno run sub.ts help exponent
```

### `multiply`

```sh
deno run sub.ts multiply -a 3 -b 8
```

_Output:_ 24

### `exponent`

```sh
deno run sub.ts exponent --base 3 --exp 8
```

_Output:_ 6561

## [`share-options-between-subs.ts`](./share-options-between-subs.ts)

### `help`

```sh
deno run share-options-between-subs.ts help
```

```sh
deno run share-options-between-subs.ts help sub1
```

```sh
deno run share-options-between-subs.ts help sub2
```

### `sub1`

```sh
deno run share-options-between-subs.ts sub1 --shared-opt foo --sub1-opt bar
```

### `sub2`

```sh
deno run share-options-between-subs.ts sub2 --shared-opt foo --sub2-opt bar
```
