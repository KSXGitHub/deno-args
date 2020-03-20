import { MAIN_COMMAND, PARSE_FAILURE } from '../lib/symbols.ts'
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
  console.log(`  => tag (${nameType(parsingResult.tag)})`, parsingResult.tag)
  switch (parsingResult.tag) {
    case PARSE_FAILURE:
      console.log('  => error', parsingResult.error)
      break
    case MAIN_COMMAND:
      console.log('  => consumedArgs', parsingResult.consumedArgs)
      for (const item of parsingResult.consumedArgs) {
        console.log('    =>', item)
      }
      console.log('  => value', parsingResult.value)
      for (const [key, value] of Object.entries(parsingResult.value)) {
        console.log('    =>', key, `(${nameType(value)})`, value)
      }
      break
    default:
      console.log('  => consumedArgs', parsingResult.consumedArgs)
      for (const item of parsingResult.consumedArgs) {
        console.log('    =>', item)
      }
      console.log('  => value', parsingResult.value)
      for (const [key, value] of Object.entries(parsingResult.value)) {
        console.log('    =>', key, `(${nameType(value)})`, value)
      }
      break
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
