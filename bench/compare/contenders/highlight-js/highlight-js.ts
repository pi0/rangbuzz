/**
 * highlight.js. Its own grammars decide what is illegal, and a corpus of
 * fragments trips that on purpose; `ignoreIllegals` is the path its own
 * auto-detection takes.
 */

import hljs from "highlight.js";

import type { Contender } from "../../contenders.ts";
import { HLJS } from "./hljs.ts";

export const highlightJs: Contender = {
  name: "highlight.js",
  grammar: (lang) => HLJS[lang] ?? undefined,
  html: (code, lang) => hljs.highlight(code, { language: lang, ignoreIllegals: true }).value,
  // `es/` is where a browser resolves them; the CommonJS `lib/` is the same
  // grammars, and the pattern takes either so the count does not depend on
  // which one the bundler picked
  carries: /\/highlight\.js\/(?:es|lib)\/languages\/[^/]+\.js$/,
  // `lib/core` and a grammar per language: the default entry is the "common"
  // bundle, forty odd grammars whether or not they are used
  ship: (grammars) =>
    `import hljs from "highlight.js/lib/core";
${grammars.map((g, i) => `import lang${i} from "highlight.js/lib/languages/${g}";`).join("\n")}

${grammars.map((g, i) => `hljs.registerLanguage(${JSON.stringify(g)}, lang${i});`).join("\n")}

export default (code, lang) => hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;`,
};
