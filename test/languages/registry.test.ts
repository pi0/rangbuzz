import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { languages } from "../../src/languages.ts";

/**
 * Fragment grammars are reached only through the `sub` of another language,
 * never passed as `lang`, and are excluded from `ShjLanguage` for that reason.
 *
 * `js_template_literals` is covered by the template literal case of
 * `js.test.ts`; `todo` by the comment case of every grammar that routes its
 * comments through it, and by the `isTodoKeyword` allowance in `_harness.ts`.
 */
const FRAGMENTS = new Set(["js_template_literals", "todo"]);

describe("registry", () => {
  it("tests every bundled language", () => {
    const tested = new Set(
      fs
        .readdirSync(import.meta.dirname)
        .filter((f) => f.endsWith(".test.ts") && f != "registry.test.ts")
        .map((f) => f.replace(".test.ts", "")),
    );

    expect(Object.keys(languages).filter((l) => !FRAGMENTS.has(l) && !tested.has(l))).toEqual([]);
    // and nothing tests a language that no longer exists
    expect([...tested].filter((l) => !(l in languages))).toEqual([]);
  });
});
