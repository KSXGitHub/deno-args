#! /bin/zsh
permissions=(
  --allow-read='./test/**/*'
)
exec deno test $permissions test/**/*.test.ts
