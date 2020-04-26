import { Option } from "../../../lib/flag-types.ts";
import { Choice } from "../../../lib/value-types.ts";
import { MAIN_COMMAND, PARSE_FAILURE } from "../../../lib/symbols.ts";
import args from "../../../lib/wrapper.ts";
import { assertEquals } from "../../deps.ts";
import { dbg, fmtTestName, tryExec } from "../../utils.ts";

type Choice = 0 | 1 | 2 | "a" | "b" | "3";

const setup = () =>
  args.with(
    Option("flag", {
      type: Choice<Choice>(
        { value: 0 },
        { value: 1 },
        { value: 2 },
        { value: "a" },
        { value: "b" },
        { value: "3" }
      ),
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

testOk("0", ["--flag", "0"], { flag: 0 });
testOk("1", ["--flag", "1"], { flag: 1 });
testOk("2", ["--flag", "2"], { flag: 2 });
testOk("a", ["--flag", "a"], { flag: "a" });
testOk("b", ["--flag", "b"], { flag: "b" });
testOk("3", ["--flag", "3"], { flag: "3" });

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
  "invalid choice",
  ["--flag", "not exist"],
  ["ValueParsingFailure"],
  "Failed to parse --flag: Invalid choice: not exist is not one of 0, 1, 2, a, b, 3"
);

Deno.test("duplicated choice (same type)", () => {
  const result = tryExec(
    () =>
      Choice<0 | 1 | 2 | "a" | "b">(
        { value: 0 },
        { value: 1 },
        { value: 2 },
        { value: "a" },
        { value: "b" },
        { value: 1 },
        { value: "b" }
      ),
    (error): error is RangeError => error instanceof RangeError
  );
  if (result.tag) throw "No error was thrown";
  assertEquals(result.error.toString(), "RangeError: Duplicated choices: 1 b");
});

Deno.test("duplicated choice (different type)", () => {
  const result = tryExec(
    () =>
      Choice<0 | 1 | "1" | 2 | "2" | "3">(
        { value: 0 },
        { value: 1 },
        { value: "1" },
        { value: 2 },
        { value: "2" },
        { value: "3" }
      ),
    (error): error is RangeError => error instanceof RangeError
  );
  if (result.tag) throw "No error was thrown";
  assertEquals(result.error.toString(), "RangeError: Duplicated choices: 1 2");
});

Deno.test("invalid numbers", () => {
  const result = tryExec(
    () =>
      Choice<number>(
        { value: 0 },
        { value: 1 },
        { value: 2 },
        { value: Infinity },
        { value: -Infinity },
        { value: NaN }
      ),
    (error): error is RangeError => error instanceof RangeError
  );
  if (result.tag) throw "No error was thrown";
  assertEquals(
    result.error.toString(),
    "RangeError: Invalid numbers: Infinity -Infinity NaN"
  );
});
