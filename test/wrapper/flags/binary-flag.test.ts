import { BinaryFlag } from "../../../lib/flag-types.ts";
import { MAIN_COMMAND } from "../../../lib/symbols.ts";
import args from "../../../lib/wrapper.ts";
import { assertEquals } from "../../deps.ts";
import { dbg, fmtTestName } from "../../utils.ts";

const setup = () =>
  args.with(BinaryFlag("flag", {
    alias: ["a", "b", "c"],
  }));

const testOk = (
  title: string,
  argv: readonly string[],
  expectedValue: unknown,
) =>
  Deno.test(fmtTestName(title, argv), () => {
    const result = setup().parse(argv);
    if (result.tag !== MAIN_COMMAND) {
      throw dbg`unexpected tag\nresult: ${result}`;
    }
    assertEquals(result.value, expectedValue);
  });

testOk("no flags", [], { flag: false });
testOk("full name", ["--flag"], { flag: true });
testOk("alias", ["-a"], { flag: true });
testOk("no conflict (grouped)", ["-abc", "--flag"], { flag: true });
testOk("no conflict (separated)", ["-a", "-b", "-c", "--flag"], { flag: true });
