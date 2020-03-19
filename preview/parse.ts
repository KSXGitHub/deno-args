import { MAIN_COMMAND } from '../lib/symbols.ts'
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
    'sub0'
  ],

  [
    'sub1'
  ],

  [
    'sub1',
    '--test'
  ],

  [
    'sub2',
    '--number', '123',
    '--text', 'This is Text'
  ],

  []
]) {
  console.log('args', args)
  const parsingResult = parser.parse(args)
  console.log('parser.parse(args)', parsingResult)
  if (parsingResult.tag) {
    console.log('  => value.tag', parsingResult.value.tag)
    console.log('  => value.value', parsingResult.value.value)
    if (parsingResult.value.tag === MAIN_COMMAND) {
      for (const [key, value] of Object.entries(parsingResult.value.value)) {
        console.log('    =>', key, `(${nameType(value)})`, value)
      }
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
