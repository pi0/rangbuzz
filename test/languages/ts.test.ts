import { testLanguage } from "./_harness.ts";

testLanguage(
  "ts",
  {
    comments: `// line\n/* block */\n/** @type {A} */`,
    types: `type Id = string | number;\ninterface Box<T> {\n  readonly value: T;\n  fn?: (a: number) => void;\n}`,
    annotations: `const a: string = "x";\nfunction f(b: number[], c?: Record<string, unknown>): void {}`,
    generics: `class Store<T extends object> implements Base<T> {\n  private items: Map<string, T> = new Map();\n}`,
    enums: `enum Color {\n  Red = 1,\n  Green = 2,\n}\nexport const enum Flag {\n  On = "on",\n}`,
    "template literals": "const s = `a ${b as string} c`;",
    numbers: `0xff 1_000 3.14 42n`,
    booleans: `true false null`,
    operators: `x satisfies Y;\na! ?? b?.c;\nlet u = <T,>(v: T) => v;`,
  },
  [
    {
      text: "A",
      judges: "cmnt",
      shj: "other",
      why: "the `{A}` of a jsdoc type is claimed by the jsdoc sub-language, which the judges read as plain comment text",
    },
  ],
);
