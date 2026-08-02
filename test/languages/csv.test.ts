import { testLanguage } from "./_harness.ts";

testLanguage(
  "csv",
  {
    rows: `name,age,city\nada,36,london\nalan,41,wilmslow`,
    quoted: `name,note\n"last, first","said ""hi"""`,
    empty: `a,,c\n,,`,
  },
  [
    {
      text: '"last, first"',
      judges: "other",
      shj: "str",
      why: "a quoted field is colored as the string it is; the judges give every field the same neutral class",
    },
  ],
);
