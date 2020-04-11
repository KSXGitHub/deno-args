import * as tsfun from "../../test/tsfun/mixed/setup.ts";
import * as wrapper from "../../test/wrapper/mixed/setup.ts";
import { assert } from "../deps.ts";

const a = tsfun.setup().extract([]);
const b = wrapper.setup().parse([]);
// assert<typeof a>(b);
assert<typeof b>(a);
