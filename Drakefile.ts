import {
  desc,
  task,
  sh,
  run
} from 'https://deno.land/x/drake@v0.16.0/mod.ts'

desc('Fetch and compile dependencies')
task('cache', [], async () => {
  await sh('deno cache **/*.ts')
})

desc('Run tests')
task('test', ['cache'], async () => {
  const permissions = [
    '--allow-read'
  ]
  await sh(`deno test ${permissions.join(' ')} test/**/*.test.ts`)
})

run()
