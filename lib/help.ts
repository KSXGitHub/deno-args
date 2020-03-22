import {
  makeIndentN,
  InitMap
} from './utils.ts'

import {
  Command,
  CommandHelp
} from './command-types.ts'

class HelpCategories extends InitMap<string, CommandHelp[]> {
  protected init (category: string): CommandHelp[] {
    return []
  }
}

export function * helpLines (command: Command<any, any>): Generator<string, void, unknown> {
  const catMap = new HelpCategories()
  for (const item of command.help()) {
    catMap.get(item.category).push(item)
  }

  for (const [category, items] of catMap) {
    yield category + ':'

    for (const { title, description } of items) {
      yield * makeIndentN(title, 2)
      if (description) yield * makeIndentN(description, 4)
    }
  }
}

export const help = (command: Command<any, any>): string => [...helpLines(command)].join('\n')
export default help
