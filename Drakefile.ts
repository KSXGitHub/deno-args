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

run()
