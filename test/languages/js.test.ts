import { testLanguage } from "./_harness.ts";

testLanguage(
  "js",
  {
    comments: `// line\n/* block\nspanning */\n/** jsdoc {@link a} */`,
    jsdoc: `/**\n * @param {string} a - the a\n * @returns {Promise<void>} nothing\n * TODO: document b\n */\nfunction f(a) {}`,
    strings: `"double" 'single' "esc\\"aped" 'a\\nb'`,
    "template literals": "`plain` `a ${b + 1} c` `nested ${`${x}`} end`",
    numbers: `0 42 3.14 .5 1e-9 0xff 0b101 0o17 1_000 42n`,
    keywords: `export default class A extends B {\n  static #x = 1;\n  async *gen() {\n    await new Promise((r) => r);\n    yield* other;\n  }\n}`,
    booleans: `true false null undefined`,
    "object keys": `const o = { a: 1, "b-c": 2, [d]: 3 };`,
    regex: `const re = /^a"b[^c]+$/gi;\nconst div = a / b / c;`,
    operators: `a ??= b?.c ?? d;\nx = y === z ? 1 : 2;\ni++, --j;\na ||= b &&= c;`,
  },
  [
    // inside a jsdoc comment the annotation language takes over, so a type or a
    // tag is no longer painted as comment text
    {
      text: " a",
      judges: "cmnt",
      shj: "other",
      why: "`{@link a}` is claimed by the jsdoc sub-language, which the judges read as plain comment text",
    },
    {
      text: '"b-c"',
      judges: "str",
      shj: "other",
      why: "object keys are deliberately left plain, quoted or not, so they read as keys rather than as strings",
    },
    // a regular expression is handed to the `regex` sub-language, which paints
    // its structure — anchors, classes, quantifiers — instead of one flat string
    {
      text: "/",
      judges: "str",
      shj: "other",
      why: "the delimiters of a regex literal belong to the regex sub-language",
    },
    {
      text: 'a"b[',
      judges: "str",
      shj: "other",
      why: "the regex sub-language paints the pattern's structure, not one string",
    },
    {
      text: "c]",
      judges: "str",
      shj: "num",
      why: "a character class is colored as a number by the regex sub-language",
    },
  ],
);
