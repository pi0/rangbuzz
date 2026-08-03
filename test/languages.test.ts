import { describe, expect, it } from "vitest";
import { tokenize } from "../src/core.ts";
import * as entry from "../src/languages.ts";
import {
  aliases,
  js,
  js_template_literals,
  jsdoc,
  languages,
  md,
  regex,
  todo,
} from "../src/languages.ts";

/** The exports that are registries rather than a language of their own */
const REGISTRIES = new Set(["aliases", "languages"]);

describe("languages entry", () => {
  it("exports every registered language under its registry name", () => {
    for (const [name, definition] of Object.entries(languages))
      expect((entry as Record<string, unknown>)[name], name).toBe(definition);

    // and nothing else: an export the registry does not know is a name a
    // `languages` option could not be keyed by
    expect(
      Object.keys(entry).filter((name) => !REGISTRIES.has(name) && !(name in languages)),
    ).toEqual([]);
  });

  it("registers every alias as the grammar it stands for", () => {
    // an alias that shadowed a language would not get this far: the entry
    // exports both under that one name, which does not compile
    for (const [name, definition] of Object.entries(aliases)) {
      // the same object, not a copy: an alias is a second name for a grammar,
      // never a second grammar
      expect(languages[name as keyof typeof languages], name).toBe(definition);
      // and the grammar it stands for is registered under a name of its own
      expect(
        Object.entries(languages).find(
          ([lang, def]) => def === definition && !(lang in aliases),
        )?.[0],
        name,
      ).toBeDefined();
    }
  });

  it("highlights through an alias", () => {
    expect(tokenize("# hi", { lang: "yml", languages })).toEqual([{ text: "# hi", type: "cmnt" }]);
    // including as the sub-language of a fenced block
    expect(tokenize("```python\nif x\n```", { lang: "md", languages })).toContainEqual({
      text: "if",
      type: "kwd",
    });
  });

  it("highlights with a registry of the languages it was given", () => {
    expect(tokenize("let a = 1", { lang: "js", languages: { js } })).toEqual([
      { text: "let", type: "kwd" },
      { text: " a " },
      { text: "=", type: "oper" },
      { text: " " },
      { text: "1", type: "num" },
    ]);
    // a fenced block resolves its language through the same registry
    expect(tokenize("```js\nlet a\n```", { lang: "md", languages: { md, js } })).toContainEqual({
      text: "let",
      type: "kwd",
    });
  });

  it("leaves a delegated region unhighlighted when its sub-language is missing", () => {
    const code = "const a = `x${1}`; // TODO fix";

    // `js` routes its comments through `todo` and its template literals through
    // `js_template_literals`: without them those regions come back untyped,
    // rather than throwing or losing text
    expect(tokenize(code, { lang: "js", languages: { js } })).toEqual([
      { text: "const", type: "kwd" },
      { text: " a " },
      { text: "=", type: "oper" },
      { text: " " },
      { text: "`x${1}`" },
      { text: "; " },
      { text: "// TODO fix" },
    ]);

    const whole = tokenize(code, {
      lang: "js",
      languages: { js, jsdoc, js_template_literals, regex, todo },
    });
    expect(whole).toContainEqual({ text: "`x", type: "str" });
    expect(whole).toContainEqual({ text: "TODO", type: "err" });
    expect(whole.map((t) => t.text).join("")).toBe(code);
  });
});
