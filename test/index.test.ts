import { describe, expect, it } from "vitest";
import { codeToHtml, detectLanguage, highlightText, tokenize } from "../src/index.ts";
import githubDark from "../src/themes/github-dark.ts";
import * as tokens from "../src/tokens.ts";
import { TOKENS } from "../src/tokens.ts";
import type { ShjLanguageDefinition } from "../src/types.ts";

describe("tokenize", () => {
  it("returns the tokens in source order", () => {
    expect(tokenize("let a = 1", { lang: "js" })).toEqual([
      { text: "let", type: "kwd" },
      { text: " a " },
      { text: "=", type: "oper" },
      { text: " " },
      { text: "1", type: "num" },
    ]);
  });

  it("returns raw text, joining back to the input", () => {
    const code = "const a = '<b>'; // hi";
    expect(
      tokenize(code, { lang: "js" })
        .map((t) => t.text)
        .join(""),
    ).toBe(code);
  });

  it("emits no empty tokens", () => {
    expect(tokenize("const a=1;", { lang: "js" }).every((t) => t.text)).toBe(true);
    expect(tokenize("", { lang: "js" })).toEqual([]);
  });

  it("defaults to plain text", () => {
    expect(tokenize("const a = 1")).toEqual([{ text: "const a = 1" }]);
  });

  it("accepts custom languages, also for sub-languages", () => {
    const mine: ShjLanguageDefinition = [[/a/g, "kwd"]];

    expect(tokenize("a b", { lang: "mine", languages: { mine } })).toEqual([
      { text: "a", type: "kwd" },
      { text: " b" },
    ]);
    // a fenced markdown block resolves its language through the same registry
    expect(tokenize("```mine\na\n```", { lang: "md", languages: { mine } })).toContainEqual({
      text: "a",
      type: "kwd",
    });
  });

  it("falls back to a single untyped token for unknown languages", () => {
    expect(tokenize("a b", { lang: "nope" as never })).toEqual([{ text: "a b" }]);
  });

  it("keeps a token that spans line breaks whole", () => {
    // documented: callers must tokenize once and split, not tokenize per line
    expect(tokenize("a; /* multi\nline */", { lang: "js" })).toContainEqual({
      text: "/* multi\nline */",
      type: "cmnt",
    });
  });
});

describe("highlightText", () => {
  it("inlines the two bundled themes as `light-dark()` colors", () => {
    expect(highlightText("const a = 1; // hi", { lang: "js" })).toBe(
      `<span style="color:light-dark(#e16,#ff7cc6)">const</span> a <span style="color:light-dark(#5af,#80c6ff)">=</span> <span style="color:light-dark(#f60,#b581fd)">1</span>; <span style="color:light-dark(#999,#7d828b);font-style:italic">// hi</span>`,
    );
  });

  it("inlines a plain color for a single theme", () => {
    expect(highlightText("const", { lang: "js", theme: githubDark })).toBe(
      `<span style="color:#ff7b72">const</span>`,
    );
  });

  it("numbers the lines of a multiline code", () => {
    const html = highlightText("a\nb", { lang: "plain" });

    expect(html).toContain(`<div class="shj-numbers" style="`);
    expect(html).toContain(`<div>1</div><div>2</div>`);
    expect(html.endsWith(`<div style="flex:1;outline:none">a\nb</div></div>`)).toBe(true);

    expect(highlightText("a\nb", { lang: "plain", lineNumbers: false })).not.toContain(
      "shj-numbers",
    );
  });

  it("sanitizes html", () => {
    expect(highlightText("<script>", { lang: "plain" })).toBe("&lt;script&gt;");
  });

  it("returns a plain string, not a promise", () => {
    expect(highlightText("a", { lang: "js" })).not.toBeInstanceOf(Promise);
  });

  it("highlights sub-languages without preloading", () => {
    // markdown fenced blocks resolve their language at tokenize time
    expect(highlightText("```js\nconst a = 1;\n```", { lang: "md", theme: githubDark })).toContain(
      "color:#ff7b72",
    );
  });

  it("falls back to plain text for unknown languages", () => {
    expect(highlightText("<a>", { lang: "nope" as never })).toBe("&lt;a&gt;");
  });
});

describe("codeToHtml", () => {
  it("renders a standalone code block", () => {
    const html = codeToHtml("a = 1", { lang: "js", theme: githubDark });

    expect(html.startsWith(`<div class="shj-lang-js shj-oneline" data-lang="js" style="`)).toBe(
      true,
    );
    expect(html).toContain("background:#161b22;color:#c9d1d9");
    expect(html.endsWith(`<span style="color:#79c0ff">1</span></div>`)).toBe(true);
    // the font family must not break out of the style attribute
    expect(html).toContain("font:normal 18px Consolas,'Courier New'");
    expect(html.match(/"/g)!.length % 2).toBe(0);
  });

  it("sets the color scheme the `light-dark()` colors resolve against", () => {
    const html = codeToHtml("a", { lang: "js" });

    expect(html).toContain("color-scheme:light dark;background:light-dark(#fff,#1a1a1c)");
    // a single theme declares its own scheme, and needs no light-dark()
    expect(codeToHtml("a", { lang: "js", theme: githubDark })).toContain(
      "color-scheme:dark;background:#161b22",
    );
  });

  it("guesses the display mode from the code", () => {
    expect(codeToHtml("a", { lang: "js" })).toContain("shj-oneline");
    expect(codeToHtml("a\nb", { lang: "js" })).toContain("shj-multiline");
  });

  it("renders inline code in a code element", () => {
    const html = codeToHtml("a", { lang: "js", inline: true });

    expect(html.startsWith(`<code class="shj-lang-js shj-inline" data-lang="js" style="`)).toBe(
      true,
    );
    expect(html).toContain("display:inline-block");
    expect(html.endsWith(">a</code>")).toBe(true);

    // inline code is never numbered, whatever it contains
    expect(codeToHtml("a\nb", { lang: "js", inline: true })).not.toContain("shj-numbers");
  });

  it("badges the method of one line http requests", () => {
    expect(codeToHtml("GET /api", { lang: "http" })).toContain(
      `<span style="background:#25f;color:#fff;padding:5px 7px;border-radius:5px">GET</span>`,
    );
  });

  it("escapes the language name", () => {
    expect(codeToHtml("a", { lang: '"><script>' as never })).toContain(
      `class="shj-lang-&#34;&gt;&lt;script&gt; shj-oneline"`,
    );
  });
});

describe("detectLanguage", () => {
  it("detects known languages", () => {
    expect(detectLanguage(`import { a } from "b";\nexport const c = () => a;`)).toBe("js");
    expect(detectLanguage("SELECT * FROM users;")).toBe("sql");
    expect(detectLanguage("")).toBe("plain");
  });
});

describe("token types", () => {
  it("numbers every type in step with its name", () => {
    // a grammar refers to a type by the constant, the engine maps it back
    // through TOKENS, so the two have to stay aligned
    for (const [constant, index] of Object.entries(tokens))
      if (typeof index == "number") expect(TOKENS[index]).toBe(constant.toLowerCase());

    expect(Object.values(tokens).filter((v) => typeof v == "number")).toHaveLength(TOKENS.length);
  });

  it("names the types a grammar refers to by index", () => {
    expect(tokenize("// a", { lang: "js" })).toEqual([{ text: "// a", type: "cmnt" }]);
    expect(tokenize("-a", { lang: "diff" })).toEqual([{ text: "-a", type: "deleted" }]);
  });

  it("still accepts a custom language naming its types", () => {
    const mine: ShjLanguageDefinition = [
      [/a/g, "kwd"],
      [/b/g, "mine-own"],
    ];

    expect(tokenize("a b", { lang: "mine", languages: { mine } })).toEqual([
      { text: "a", type: "kwd" },
      { text: " " },
      { text: "b", type: "mine-own" },
    ]);
  });
});
