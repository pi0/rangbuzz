/**
 * Shiki on [its JavaScript `RegExp` engine][engine], which trades some grammar
 * compatibility for not shipping the WebAssembly — the comparison closest to
 * ours, since that engine and this library are running the same primitive.
 *
 * [engine]: https://shiki.style/guide/regex-engines#javascript-regexp-engine
 */

import { createHighlighter } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

import { JUDGED } from "../../../../test/languages/_judges.ts";
import type { Contender } from "../../contenders.ts";
import { SHIKI_LANGS, shikiLangs, shikiShip } from "./shiki.ts";

// Its own highlighter rather than the singleton `shiki-oniguruma.ts` builds:
// the engine is chosen when the highlighter is built, so the two cannot share
// one. Strict — every grammar here compiles without `forgiving`, which would
// trade accuracy for reach.
const jsRegexp = await createHighlighter({
  langs: shikiLangs,
  themes: ["github-dark"],
  engine: createJavaScriptRegexEngine(),
});

export const shikiJsRegexp: Contender = {
  name: "shiki (js regexp)",
  grammar: (lang) => JUDGED[lang]?.shiki,
  html: (code, lang) => jsRegexp.codeToHtml(code, { lang, theme: "github-dark" }),
  carries: SHIKI_LANGS,
  ship: shikiShip(
    "createJavaScriptRegexEngine()",
    `import { createJavaScriptRegexEngine } from "shiki/engine/javascript";`,
  ),
};
