import { MAIN_COMMAND, PARSE_FAILURE } from "../../lib/symbols.ts";
import * as tsfun from "../../test/tsfun/mixed/setup.ts";
import * as wrapper from "../../test/wrapper/mixed/setup.ts";
import { assert } from "../deps.ts";

const a = tsfun.setup().extract([]);
const b = wrapper.setup().parse([]);
assert<typeof b>(a);

if (a.tag === MAIN_COMMAND && b.tag === MAIN_COMMAND) {
  assert<typeof a>(b);
}

if (a.tag !== PARSE_FAILURE && b.tag !== PARSE_FAILURE) {
  assert<typeof a>(b);
}
