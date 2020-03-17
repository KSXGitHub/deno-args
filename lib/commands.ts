type CommandReturn<Main, Sub extends CommandReturn<any, any>> =
  CommandReturn.Main<Main> | CommandReturn.Sub<Sub>

namespace CommandReturn {
  interface Base<Value> {
    readonly type: 'main' | 'sub'
    readonly value: Value
  }

  export interface Main<Value> extends Base<Value> {
    readonly type: 'main'
  }

  export interface Sub<Value extends CommandReturn<any, any>> extends Base<Value> {
    readonly type: 'sub'
  }
}
