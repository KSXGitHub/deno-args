import { MAIN_COMMAND } from "../../lib/symbols.ts";
import * as tsfun from "../../test/tsfun/mixed/setup.ts";
import * as wrapper from "../../test/wrapper/mixed/setup.ts";
import { assert } from "../deps.ts";

const a = tsfun.setup().extract([]);
const b = wrapper.setup().parse([]);
assert<typeof b>(a);

if (a.tag === MAIN_COMMAND && b.tag === MAIN_COMMAND) {
  assert<typeof a>(b);
}
