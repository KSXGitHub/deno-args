import { EarlyExitFlag } from "../../../lib/flag-types.ts";
import { MAIN_COMMAND } from "../../../lib/symbols.ts";
import args from "../../../lib/wrapper.ts";
import { assertEquals } from "../../deps.ts";
import { dbg, tryExec, fmtTestName } from "../../utils.ts";

const testOk = (title: string, argv: readonly string[], expected: boolean) =>
  Deno.test(fmtTestName(title, argv), () => {
    const signal = Symbol("signal");
    const parser = args.with(
      EarlyExitFlag("flag", {
        alias: ["a", "b", "c"],
        exit() {
          throw signal;
        },
      })
    );
    const result = tryExec(
      () => parser.parse(argv),
      (error): error is typeof signal => error === signal
    );
    if (result.tag) {
      if (result.value.tag !== MAIN_COMMAND) {
        throw dbg`unexpected tag\nresult: ${result.value}`;
      }
      assertEquals(expected, false);
    } else {
      assertEquals(expected, true);
    }
  });

testOk("no flags", [], false);
testOk("full name", ["--flag"], true);
testOk("alias", ["-a"], true);
testOk("no conflict", ["-abc", "--flag"], true);
testOk("no conflict", ["-a", "-b", "-c", "--flag"], true);
