import { testLanguage } from "./_harness.ts";

testLanguage(
  "json",
  {
    object: `{\n  "name": "app",\n  "version": "1.0.0"\n}`,
    numbers: `{ "int": 42, "float": 3.14, "exp": 1e-9, "negative": -1 }`,
    booleans: `{ "yes": true, "no": false, "nothing": null }`,
    nested: `{\n  "list": [1, "two", { "a": true }],\n  "empty": {}\n}`,
    escapes: `{ "quote": "a \\" b", "unicode": "\\u00e9" }`,
    jsonc: `{\n  // line comment\n  "a": 1, /* block\n  comment */\n  "url": "https://x.dev" // not a comment above\n}`,
    json5: `{ unquoted: 'single', hex: 0xff, big: Infinity, nan: NaN, trailing: [1, 2,] }`,
  },
  [
    {
      text: `'single'`,
      judges: "other",
      shj: "str",
      why: "json5 quotes strings either way, and `json5` is an alias of this grammar; both judges only know strict json, where a single quote is a syntax error",
    },
  ],
);
