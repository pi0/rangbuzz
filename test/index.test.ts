import { describe, expect, it } from "vitest";
import { detectLanguage } from "../src/detect.ts";
import { highlightText } from "../src/index.ts";

describe("highlightText", () => {
  it("highlights inline code", () => {
    expect(highlightText("const a = 1; // hi", "js", false)).toBe(
      `<span class="shj-syn-kwd">const</span> a <span class="shj-syn-oper">=</span> <span class="shj-syn-num">1</span>; <span class="shj-syn-cmnt">// hi</span>`,
    );
  });

  it("wraps multiline code with line numbers", () => {
    const res = highlightText("a\nb", "plain");
    expect(res).toContain(`<div class="shj-numbers"><div></div><div></div></div>`);
  });

  it("sanitizes html", () => {
    expect(highlightText("<script>", "plain", false)).toBe("&lt;script&gt;");
  });

  it("returns a plain string, not a promise", () => {
    expect(highlightText("a", "js", false)).not.toBeInstanceOf(Promise);
  });

  it("highlights sub-languages without preloading", () => {
    // markdown fenced blocks resolve their language at tokenize time
    expect(highlightText("```js\nconst a = 1;\n```", "md", false)).toContain("shj-syn-kwd");
  });

  it("falls back to plain text for unknown languages", () => {
    expect(highlightText("<a>", "nope" as never, false)).toBe("&lt;a&gt;");
  });
});

describe("detectLanguage", () => {
  it("detects known languages", () => {
    expect(detectLanguage(`import { a } from "b";\nexport const c = () => a;`)).toBe("js");
    expect(detectLanguage("SELECT * FROM users;")).toBe("sql");
    expect(detectLanguage("")).toBe("plain");
  });
});
