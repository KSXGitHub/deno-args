import parser from './parser.ts'

for (const args of [
  [
    '--choice', '123',
    '--text', 'This is Text',
    '--integer', '777',
    '--number', '57.3'
  ],

  [
    '--choice', 'foo',
    '--text', 'This is another piece of text',
    '--integer', '33',
    '--number', '57.3',
    '--foo',
    '--bar'
  ],

  []
]) {
  console.log('args', args)
  const parsingResult = parser.parse(args)
  console.log('parser.parse(args)', parsingResult)
  if (parsingResult.tag) {
    console.log('  => value', parsingResult.value)
    for (const [key, value] of Object.entries(parsingResult.value)) {
      console.log('    =>', key, value)
    }
  } else {
    console.log('  => error', parsingResult.error)
  }
  console.log()
}
