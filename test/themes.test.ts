import { describe, expect, it, vi } from "vitest";
import { defaultThemes } from "../src/defaults.ts";
import { codeToAnsi, printHighlight } from "../src/index.ts";
import * as bundled from "../src/themes/index.ts";
// the full list, so a new token type has to be given a custom property too
import { TOKENS as ALL_TOKENS } from "../src/tokens.ts";
import type { ShjTheme, ShjThemeName, ShjToken } from "../src/types.ts";
import githubDark from "../src/themes/github-dark.ts";

const THEMES: ShjTheme[] = Object.values(bundled);

// the one theme that carries custom properties rather than colors
const COLORED: ShjTheme[] = THEMES.filter((theme) => theme !== bundled.cssVariables);

const NAMES: ShjThemeName[] = [
  "atom-dark",
  "css-variables",
  "dark",
  "default",
  "github-dark",
  "github-dim",
  "github-light",
  "visual-studio-dark",
];

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
  "bracket",
];

describe("themes", () => {
  it("exposes every theme as plain data", () => {
    for (const theme of COLORED) {
      const name = theme.name;
      expect(theme.bg).toMatch(/^#[\da-f]{3,8}$/);
      expect(theme.fg).toMatch(/^#[\da-f]{3,8}$/);
      // every token type used by the languages is colored
      for (const token of TOKENS) expect(theme.tokens[token], `${name}.${token}`).toMatch(/^#/);
    }
  });

  it("names every bundled theme in `ShjThemeName`", () => {
    expect(THEMES.map((theme) => theme.name).sort()).toEqual([...NAMES].sort());
  });

  it("defers every color of the css-variables theme to a custom property", () => {
    const theme = bundled.cssVariables;

    expect(theme.bg).toBe("var(--shj-bg)");
    expect(theme.fg).toBe("var(--shj-fg)");
    // the line numbers keep falling back to the comment color
    expect(theme.numbers).toBe("var(--shj-numbers,var(--shj-cmnt))");
    // every token type, `esc` included — the caller owns the whole palette
    for (const token of ALL_TOKENS) expect(theme.tokens[token], token).toBe(`var(--shj-${token})`);
    // nothing is left to resolve against a color scheme
    expect(theme.scheme).toBeUndefined();
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

  it("expands short hex colors", () => {
    // #1a2 -> #11aa22 -> 17;170;34, and the alpha channel of #1a2f is ignored
    for (const kwd of ["#1a2", "#1a2f"]) {
      expect(
        codeToAnsi("const a", {
          lang: "js",
          theme: { name: "custom", bg: "#000", fg: "#fff", tokens: { kwd } },
        }),
      ).toBe("[38;2;17;170;34mconst[0m a");
    }
  });

  it("defaults to plain text", () => {
    expect(codeToAnsi("const a")).toBe("const a");
  });

  it("leaves a color it cannot resolve uncolored", () => {
    // a custom property has no channels to emit: it must not become `NaN`
    expect(codeToAnsi("const a", { lang: "js", theme: bundled.cssVariables })).toBe("const a");
    expect(
      codeToAnsi("const a", {
        lang: "js",
        theme: { name: "custom", bg: "#000", fg: "#fff", tokens: { kwd: "rebeccapurple" } },
      }),
    ).toBe("const a");
  });

  it("prints the highlighted code", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    printHighlight("const a", { lang: "js" });
    expect(log).toHaveBeenCalledWith("[38;2;255;124;198mconst[0m a");
    log.mockRestore();
  });
});
