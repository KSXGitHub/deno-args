import parser from './parser.ts'

for (const args of [
  [
    '--choice', '123',
    '--text', 'This is Text',
    '--integer', '777',
    '--number', '57.3'
  ],
  []
]) {
  console.log('args', args)
  const parsingResult = parser.parse(args)
  console.log('parser.parse(args)', parsingResult)
  if (parsingResult.tag) {
    console.log('=> value', parsingResult.value)
    for (const [key, value] of Object.entries(parsingResult.value)) {
      console.log('=> value.' + key, value)
    }
  } else {
    console.log('=> error', parsingResult.error)
  }
  console.log()
}
