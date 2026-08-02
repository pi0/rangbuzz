import { describe, expect, it } from "vitest";
import { detectLanguage } from "../src/detect.ts";
import { highlightText } from "../src/index.ts";

describe("highlightText", () => {
  it("highlights inline code", async () => {
    expect(await highlightText("const a = 1; // hi", "js", false)).toBe(
      `<span class="shj-syn-kwd">const</span> a <span class="shj-syn-oper">=</span> <span class="shj-syn-num">1</span>; <span class="shj-syn-cmnt">// hi</span>`,
    );
  });

  it("wraps multiline code with line numbers", async () => {
    const res = await highlightText("a\nb", "plain");
    expect(res).toContain(`<div class="shj-numbers"><div></div><div></div></div>`);
  });

  it("sanitizes html", async () => {
    expect(await highlightText("<script>", "plain", false)).toBe("&lt;script&gt;");
  });
});

describe("detectLanguage", () => {
  it("detects known languages", () => {
    expect(detectLanguage(`import { a } from "b";\nexport const c = () => a;`)).toBe("js");
    expect(detectLanguage("SELECT * FROM users;")).toBe("sql");
    expect(detectLanguage("")).toBe("plain");
  });
});
