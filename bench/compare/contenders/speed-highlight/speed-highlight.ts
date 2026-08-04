/**
 * Speed Highlight, the project this one is a fork of — measured as it ships,
 * `highlightText()` awaited, since its tokenizer is an `async function` that
 * awaits itself through every sub-language. `multiline: false` for the same
 * reason our own rows run with `lineNumbers: false`: it is the same gutter,
 * built the same way, and neither row should be paying for markup the other
 * is not.
 */

import { highlightText, type ShjLanguage as SpeedLanguage } from "@speed-highlight/core";

import { CORPUS } from "../../../_corpus.ts";
import type { Contender } from "../../contenders.ts";
import { SPEED } from "./speed.ts";

// Speed Highlight has no highlighter to build and no registry to fill: it loads
// a grammar the first time something asks for it and caches it under its name,
// which is a load the other contenders have already done by now. So the corpus
// is run through it once, which is the only way in — and the whole corpus
// rather than a token of each language, because a sub-language is loaded the
// same way, on the first line of code that reaches it.
await Promise.all(
  CORPUS.flatMap((c) => {
    const grammar = SPEED[c.lang];
    return grammar ? c.snippets.map((code) => highlightText(code, grammar, false)) : [];
  }),
);

export const speedHighlight: Contender = {
  name: "speed-highlight",
  grammar: (lang) => SPEED[lang] ?? undefined,
  // the cast is the map above being narrower than this signature: `grammar`
  // returned one of its values, which is a grammar it has by construction
  html: (code, lang) => highlightText(code, lang as SpeedLanguage, false),
  awaits: true,
  carries: /"\.\/languages\/[^"]+\.js"/g,
  inlined: true,
  // no registration and no highlighter to build: the entry is the API, and
  // the grammars come with it whether or not they are wanted. What the
  // warmup above does in this process, the bundle does at its top level, so
  // what the `warmup` column times is the same work.
  ship: (grammars) =>
    `import { highlightText } from "@speed-highlight/core";

await Promise.all(${JSON.stringify(grammars)}.map((lang) => highlightText("", lang, false)));

export default (code, lang) => highlightText(code, lang, false);`,
};
