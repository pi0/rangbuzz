import { testLanguage } from "./_harness.ts";

const value = (text: string) => ({
  text,
  judges: "other" as const,
  shj: "str" as const,
  why: "everything a rule does not claim is a value, and a value is colored as a string",
});

testLanguage(
  "ini",
  {
    comments: `; semicolon comment\n# hash comment\nkey = 1 ; TODO: check`,
    sections: `[server]\nhost = localhost\n\n[client]\nport = 8080`,
    values: `name = app\nquoted = "a value"\nempty =\npath = /usr/local`,
    numbers: `port = 8080\nratio = 0.5\nnegative = -1`,
  },
  // the last rule of the grammar is `{ type: "str", match: /.*/ }`: an ini value
  // is a string whether it is quoted or not, which no judge does
  [
    value(" 1 "),
    value(" localhost"),
    value(" 8080"),
    value(" app"),
    value(" /usr/local"),
    value(" 0.5"),
    value(" -1"),
  ],
);
