/**
 * Shiki on Oniguruma compiled to WebAssembly, which is what it uses unless
 * told otherwise. Strict, not `forgiving`: every grammar the corpus needs
 * compiles under it, so nothing here is being highlighted by a pattern that
 * was quietly given up on.
 */

import { createHighlighter } from "shiki";

import { JUDGED } from "../../../../test/languages/_judges.ts";
import type { Contender } from "../../contenders.ts";
import { SHIKI_LANGS, shikiLangs, shikiShip } from "./shiki.ts";

const oniguruma = await createHighlighter({ langs: shikiLangs, themes: ["github-dark"] });

export const shikiOniguruma: Contender = {
  name: "shiki (oniguruma)",
  grammar: (lang) => JUDGED[lang]?.shiki,
  html: (code, lang) => oniguruma.codeToHtml(code, { lang, theme: "github-dark" }),
  carries: SHIKI_LANGS,
  // the WebAssembly is part of what it ships, so it is part of what it
  // weighs — `shiki/wasm` is the inlined one its fine-grained bundle
  // documents, so the bytes are in the chunk rather than in a file beside it
  ship: shikiShip(
    "createOnigurumaEngine(wasm)",
    `import { createOnigurumaEngine } from "shiki/engine/oniguruma";\nimport wasm from "shiki/wasm";`,
  ),
};
