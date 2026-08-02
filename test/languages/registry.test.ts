import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { languages } from "../../src/languages.ts";

/**
 * `js_template_literals` is a fragment grammar reached only through the rules
 * of `js`, never passed as `lang`, and it is excluded from `ShjLanguage` for
 * that reason. It is covered by the template literal case of `js.test.ts`.
 */
const FRAGMENTS = new Set(["js_template_literals"]);

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
