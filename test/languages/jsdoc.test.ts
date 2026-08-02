import { testLanguage } from "./_harness.ts";

// reached from `js` and `ts`, never passed as `lang` by a caller, and handed
// the whole comment including its delimiters; the `todo` rules are spread in,
// so its keywords are matched here too
testLanguage("jsdoc", {
  tags: `/** @param @returns @example @deprecated */`,
  types: `/**\n * @param {string|number} a\n * @returns {Promise<void>}\n */`,
  optional: `/** @param {string} [name="a"] the name */`,
  todo: `/**\n * TODO: document this\n * CHANGED the signature, FIX applied\n * QUESTION: still needed?\n */`,
  prose: `/** Describes what the function does. */`,
});
