import {
  BLANK,
  Describe,
  FlaggedCommand,
  SubCommand,
} from "../../../lib/command-types.ts";
import {
  EarlyExitFlag,
  Flag,
  CountFlag,
  Option,
  PartialOption,
  CollectOption,
} from "../../../lib/flag-types.ts";
import {
  FiniteNumber,
  Integer,
  Text,
  Choice,
} from "../../../lib/value-types.ts";
import { fmtTestName } from "../../utils.ts";
import { pass } from "../deps.ts";

export const setup = pass(BLANK)
  .to(Describe, "Top level command")
  .to(
    FlaggedCommand,
    EarlyExitFlag("early-exit", {
      exit() {
        throw "Not meant to be called!";
      },
    })
  )
  .to(
    FlaggedCommand,
    Flag("foo", {
      alias: ["f"],
      describe: "Boolean flag of foo",
    })
  )
  .to(FlaggedCommand, Flag("bar"))
  .to(
    FlaggedCommand,
    CountFlag("count", {
      alias: ["c"],
      describe: "Counting",
    })
  )
  .to(
    FlaggedCommand,
    Option("number", {
      alias: ["N"],
      type: FiniteNumber,
      describe: "An integer or a floating-point number",
    })
  )
  .to(
    FlaggedCommand,
    Option("integer", {
      type: Integer,
      describe: "An arbitrary large integer",
    })
  )
  .to(
    FlaggedCommand,
    Option("text", {
      type: Text,
    })
  )
  .to(
    FlaggedCommand,
    PartialOption("partial-integer", {
      type: Integer,
      describe: "An optional integer",
      default: BigInt("123"),
    })
  )
  .to(
    FlaggedCommand,
    Option("choice", {
      type: Choice<123 | "foo" | 456 | "bar" | "789">(
        { value: 123 },
        { value: "foo" },
        { value: 456, describe: "Not 123" },
        { value: "bar", describe: "Not Foo" },
        { value: "789", describe: "Not a number" }
      ),
      describe: "Choice to make",
    })
  )
  .to(
    FlaggedCommand,
    CollectOption("collect", {
      type: Text,
      describe: "Text segments",
    })
  )
  .to(
    SubCommand,
    "sub0" as const,
    pass(BLANK).to(Describe, "Sub command without flags").get()
  )
  .to(
    SubCommand,
    "sub1" as const,
    pass(BLANK)
      .to(Describe, "Sub command with one flag")
      .to(
        FlaggedCommand,
        Flag("test", {
          describe: "Test flag for sub1",
        })
      )
      .get()
  )
  .to(
    SubCommand,
    "sub2" as const,
    pass(BLANK)
      .to(Describe, "Sub command with two flags")
      .to(
        FlaggedCommand,
        Option("number", {
          type: FiniteNumber,
          describe: "Number option for sub2",
        })
      )
      .to(
        FlaggedCommand,
        Option("text", {
          type: Text,
          describe: "Text option for sub2",
        })
      )
      .get()
  ).get;

export interface Case<Output> {
  readonly title: string;
  readonly input: readonly string[];
  readonly output: Output;
}

export const test = (param: Case<unknown>, fn: () => void | Promise<void>) =>
  Deno.test(fmtTestName(param.title, param.input), fn);
