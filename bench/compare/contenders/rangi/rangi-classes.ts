/**
 * The same call with `classes: true`, which is the mode that emits
 * `shj-`prefixed class names and no `style` attribute — the markup Prism,
 * highlight.js and Speed Highlight emit, and so the row to read against
 * theirs. No theme is passed because none is consulted: the colours are a
 * stylesheet's problem in this mode, exactly as they are in theirs.
 */

import { fileURLToPath } from "node:url";

import { codeToHtml } from "../../../../src/index.ts";
import type { Contender } from "../../contenders.ts";

/** `src/`, as a bundler resolves it from the generated entry */
const SRC = fileURLToPath(new URL("../../../../src/", import.meta.url));

export const rangiClasses: Contender = {
  name: "rangi (classes)",
  mine: true,
  grammar: (lang) => lang,
  html: (code, lang) => codeToHtml(code, { lang, classes: true, lineNumbers: false }),
  carries: /\/src\/languages\/[^/]+\.ts$/,
  // one import lighter than `rangi`, and only one: the main entry pulls the
  // two default themes in whether or not a call reads them, so what class
  // mode takes out of the bundle is `github-dark` and nothing else
  ship: () =>
    `import { codeToHtml } from ${JSON.stringify(`${SRC}index.ts`)};

export default (code, lang) => codeToHtml(code, { lang, classes: true, lineNumbers: false });`,
};
