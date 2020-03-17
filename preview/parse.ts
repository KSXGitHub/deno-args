import command from './command.ts'

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

  [
    '--choice', '789',
    '--text', 'Text Text Text',
    '--integer', '22',
    '--number', '517.3',
    '--bar',
    'abc',
    'def',
    'ghi'
  ],

  [
    'aliases',
    '-fccc',
    '-N', '-45.4',
    '--integer', '-123',
    '--text', 'hello there',
    '--choice', '789'
  ],

  [
    'foo',
    '--def', 'This is --def'
  ],

  [
    'bar',
    '--ghi', 'G'
  ],

  []
]) {
  console.log('args', args)
  const parsingResult = command.parse(args)
  console.log('parser.parse(args)', parsingResult)
  if (parsingResult.tag) {
    console.log('  => value', parsingResult.value)
    for (const [key, value] of Object.entries(parsingResult.value)) {
      console.log('    =>', key, `(${nameType(value)})`, value)
    }
  } else {
    console.log('  => error', parsingResult.error)
  }
  console.log()
}

function nameType (value: unknown) {
  const typeName = typeof value
  if (typeName !== 'object') return typeName
  if (!value) return 'null' as const
  if (Array.isArray(value)) return 'array' as const
  return 'object' as const
}
