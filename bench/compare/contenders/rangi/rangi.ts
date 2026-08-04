/**
 * Us, inlining the theme as `style` attributes — the mode this library
 * defaults to, and the one Shiki's own two rows are read against.
 */

import { fileURLToPath } from "node:url";

import { codeToHtml } from "../../../../src/index.ts";
import { githubDark } from "../../../../src/themes/index.ts";
import type { Contender } from "../../contenders.ts";

/** `src/`, as a bundler resolves it from the generated entry */
const SRC = fileURLToPath(new URL("../../../../src/", import.meta.url));

export const rangi: Contender = {
  name: "rangi",
  mine: true,
  grammar: (lang) => lang,
  html: (code, lang) => codeToHtml(code, { lang, theme: githubDark, lineNumbers: false }),
  // the grammars are not chosen: the main entry is the registry, whichever
  // languages the run happens to compare, so this counts every one of them
  carries: /\/src\/languages\/[^/]+\.ts$/,
  ship: () =>
    `import { codeToHtml } from ${JSON.stringify(`${SRC}index.ts`)};
import { githubDark } from ${JSON.stringify(`${SRC}themes/index.ts`)};

export default (code, lang) => codeToHtml(code, { lang, theme: githubDark, lineNumbers: false });`,
};
