import {
  assertEquals,
} from "../../deps.ts";

import {
  dbg,
} from "../../utils.ts";

import {
  Case,
  setup,
  test,
} from "./setup.ts";

type OkCase = Case<{
  readonly value: Value;
  readonly remainingRawArgs: readonly string[];
}>;

interface Value {
  readonly "shared-binary-flag": boolean;
  readonly "shared-count-flag": number;
  readonly "sub-binary-flag": boolean;
}

const okCases: OkCase[] = [
  {
    title: "empty",
    input: ["sub"],
    output: {
      value: {
        "shared-binary-flag": false,
        "shared-count-flag": 0,
        "sub-binary-flag": false,
      },
      remainingRawArgs: [],
    },
  },

  {
    title: "just one",
    input: [
      "sub",
      "--shared-binary-flag",
      "--shared-count-flag",
      "--sub-binary-flag",
    ],
    output: {
      value: {
        "shared-binary-flag": true,
        "shared-count-flag": 1,
        "sub-binary-flag": true,
      },
      remainingRawArgs: [],
    },
  },

  {
    title: "with remains",
    input: [
      "sub",
      "abc",
      "--shared-binary-flag",
      "def",
      "--shared-count-flag",
      "--sub-binary-flag",
    ],
    output: {
      value: {
        "shared-binary-flag": true,
        "shared-count-flag": 1,
        "sub-binary-flag": true,
      },
      remainingRawArgs: ["abc", "def"],
    },
  },
];

okCases.forEach((param) =>
  test(param, () => {
    const { input, output } = param;
    const result = setup().parse(input);
    if (result.tag !== "sub") {
      throw dbg`unexpected tag\nResult: ${result}`;
    }
    const { value } = result.value;
    const remainingRawArgs = result.value.remaining().rawArgs();
    assertEquals({ value, remainingRawArgs }, output);
  })
);
