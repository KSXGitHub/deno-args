import { CountFlag } from "../../../lib/flag-types.ts";
import { MAIN_COMMAND } from "../../../lib/symbols.ts";
import args from "../../../lib/wrapper.ts";
import { assertEquals } from "../../deps.ts";
import { dbg, fmtTestName } from "../../utils.ts";

const setup = () =>
  args.with(
    CountFlag("flag", {
      alias: ["a", "b", "c"],
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

testOk("no flags", [], { flag: 0 });
testOk("full name", ["--flag"], { flag: 1 });
testOk("alias", ["-a"], { flag: 1 });
testOk("no conflict (grouped)", ["-abc", "--flag"], { flag: 3 + 1 });
testOk("no conflict (separated)", ["-a", "-b", "-c", "--flag"], { flag: 4 });
testOk("another", ["-abc", "-a", "-b", "-c", "--flag", "--flag"], {
  flag: 3 + 3 + 2,
});
