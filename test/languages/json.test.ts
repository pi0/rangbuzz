import { testLanguage } from "./_harness.ts";

testLanguage("json", {
  object: `{\n  "name": "app",\n  "version": "1.0.0"\n}`,
  numbers: `{ "int": 42, "float": 3.14, "exp": 1e-9, "negative": -1 }`,
  booleans: `{ "yes": true, "no": false, "nothing": null }`,
  nested: `{\n  "list": [1, "two", { "a": true }],\n  "empty": {}\n}`,
  escapes: `{ "quote": "a \\" b", "unicode": "\\u00e9" }`,
});
