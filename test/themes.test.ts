import { describe, expect, it } from "vitest";
import { defaultThemes } from "../src/defaults.ts";
import { codeToAnsi } from "../src/terminal.ts";
import { themes } from "../src/themes/index.ts";
import type { ShjToken } from "../src/types.ts";
import githubDark from "../src/themes/github-dark.ts";

const TOKENS: ShjToken[] = [
  "deleted",
  "err",
  "var",
  "section",
  "kwd",
  "class",
  "cmnt",
  "insert",
  "type",
  "func",
  "bool",
  "num",
  "oper",
  "str",
];

describe("themes", () => {
  it("exposes every theme as plain data", () => {
    for (const [name, theme] of Object.entries(themes)) {
      expect(theme.name).toBe(name);
      expect(theme.bg).toMatch(/^#[\da-f]{3,8}$/);
      expect(theme.fg).toMatch(/^#[\da-f]{3,8}$/);
      // every token type used by the languages is colored
      for (const token of TOKENS) expect(theme.tokens[token], `${name}.${token}`).toMatch(/^#/);
    }
  });
});

describe("terminal", () => {
  it("colors the tokens with 24 bit escape sequences", () => {
    // the dark theme of the default pair, #ff7cc6 -> 255;124;198
    expect(codeToAnsi("const a", { lang: "js" })).toBe("[38;2;255;124;198mconst[0m a");
    // #ff7b72 -> 255;123;114
    expect(codeToAnsi("const a", { lang: "js", theme: githubDark })).toBe(
      "[38;2;255;123;114mconst[0m a",
    );
  });

  it("reads a light/dark pair as its dark theme", () => {
    expect(codeToAnsi("const a", { lang: "js", theme: defaultThemes })).toBe(
      "[38;2;255;124;198mconst[0m a",
    );
  });

  it("accepts a custom theme", () => {
    expect(
      codeToAnsi("const a", {
        lang: "js",
        theme: { name: "custom", bg: "#000", fg: "#fff", tokens: { kwd: "#010203" } },
      }),
    ).toBe("[38;2;1;2;3mconst[0m a");
  });
});
