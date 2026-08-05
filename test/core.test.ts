import { describe, expect, it, vi } from "vitest";
import { codeToAnsi, codeToHtml, highlightText, printHighlight, tokenize } from "../src/core.ts";
import js from "../src/languages/js.ts";
import md from "../src/languages/md.ts";
import githubDark from "../src/themes/github-dark.ts";
import type { ShjLanguageDefinition } from "../src/types.ts";

const languages = { js, md };

describe("core", () => {
  it("tokenizes with the given languages", () => {
    expect(tokenize("let a = 1", { lang: "js", languages })).toEqual([
      { text: "let", type: "kwd" },
      { text: " a " },
      { text: "=", type: "oper" },
      { text: " " },
      { text: "1", type: "num" },
    ]);
  });

  it("resolves sub-languages through the given registry only", () => {
    // `md` reaches `js` through the registry it was handed
    expect(tokenize("```js\nlet a\n```", { lang: "md", languages })).toContainEqual({
      text: "let",
      type: "kwd",
    });
    // and finds nothing when the sub-language is not in it
    expect(tokenize("```js\nlet a\n```", { lang: "md", languages: { md } })).not.toContainEqual({
      text: "let",
      type: "kwd",
    });
  });

  it("falls back to a single untyped token with an empty registry", () => {
    expect(tokenize("let a = 1", { lang: "js", languages: {} })).toEqual([{ text: "let a = 1" }]);
    expect(tokenize("let a = 1", { languages: {} })).toEqual([{ text: "let a = 1" }]);
  });

  it("takes a custom language like any other", () => {
    const mine: ShjLanguageDefinition = [[/a/g, "kwd"]];

    expect(tokenize("a b", { lang: "mine", languages: { mine } })).toEqual([
      { text: "a", type: "kwd" },
      { text: " b" },
    ]);
  });

  it("renders with the given theme, without any default", () => {
    expect(highlightText("const", { lang: "js", languages, theme: githubDark })).toBe(
      `<span style="color:#ff7b72">const</span>`,
    );
    const html = codeToHtml("a = 1", { lang: "js", languages, theme: githubDark });

    expect(html.startsWith(`<div class="shj-lang-js shj-oneline" data-lang="js" style="`)).toBe(
      true,
    );
    expect(html).toContain("color-scheme:dark;background:#0d1117;color:#e6edf3");
    expect(html.endsWith(`<span style="color:#79c0ff">1</span></div>`)).toBe(true);
  });

  it("renders class names without any theme at all", () => {
    expect(highlightText("const", { lang: "js", languages, classes: true })).toBe(
      `<span class="shj-kwd">const</span>`,
    );
    expect(codeToHtml("a = 1", { lang: "js", languages, classes: true })).toBe(
      `<div class="shj shj-lang-js shj-oneline" data-lang="js">a <span class="shj-oper">=</span> <span class="shj-num">1</span></div>`,
    );
  });

  it("colors the terminal output with the given theme", () => {
    // #ff7b72 -> 255;123;114
    expect(codeToAnsi("const a", { lang: "js", languages, theme: githubDark })).toBe(
      "[38;2;255;123;114mconst[0m a",
    );

    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    printHighlight("const a", { lang: "js", languages, theme: githubDark });
    expect(log).toHaveBeenCalledWith("[38;2;255;123;114mconst[0m a");
    log.mockRestore();
  });
});
