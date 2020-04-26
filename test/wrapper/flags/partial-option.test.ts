import { PartialOption } from "../../../lib/flag-types.ts";
import { Text } from "../../../lib/value-types.ts";
import { MAIN_COMMAND, PARSE_FAILURE } from "../../../lib/symbols.ts";
import args from "../../../lib/wrapper.ts";
import { assertEquals } from "../../deps.ts";
import { dbg, fmtTestName } from "../../utils.ts";

const setup = () =>
  args.with(
    PartialOption("flag", {
      alias: ["a", "b", "c"],
      type: Text,
      default: "default",
    })
  );

const testOk = (
  title: string,
  argv: readonly string[],
  expectedValue: unknown
) =>
  Deno.test(fmtTestName(title, argv), () => {
    const result = setup().parse(argv);
    if (result.tag !== MAIN_COMMAND) {
      throw dbg`unexpected tag\nresult: ${result}`;
    }
    assertEquals(result.value, expectedValue);
  });

testOk("no flag", [], { flag: "default" });
testOk("full name", ["--flag", "hello"], { flag: "hello" });
testOk("alias", ["-a", "hello"], { flag: "hello" });
testOk("alias", ["-b", "hello"], { flag: "hello" });
testOk("alias", ["-c", "hello"], { flag: "hello" });

const testErr = (
  name: string,
  argv: readonly string[],
  expectedTypes: readonly string[],
  expectedMessages: string
) =>
  Deno.test(name, () => {
    const result = setup().parse(argv);
    if (result.tag !== PARSE_FAILURE) {
      throw dbg`unexpected tag\nresult: ${result}`;
    }
    assertEquals(
      {
        types: result.error.errors.map((x) => x.constructor.name),
        messages: result.error.toString(),
      },
      {
        types: expectedTypes,
        messages: expectedMessages,
      }
    );
  });

testErr(
  "missing value",
  ["--flag"],
  ["MissingValue"],
  "Option --flag requires a value but none was found"
);
testErr(
  "unexpected flag",
  ["--flag", "-X"],
  ["UnexpectedFlag"],
  "Option --flag requires a value but received flag -X instead"
);
testErr(
  "conflict",
  ["--flag", "123", "-abc", "456"],
  ["ConflictFlags"],
  "Conflicting options: --flag -a -b -c"
);
