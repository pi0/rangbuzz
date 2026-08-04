/**
 * Lezer — not matching patterns at all, but building a syntax tree per block
 * with `@lezer/highlight`'s `highlightCode()` reading the colours off it. See
 * `./lezer-grammars.ts` for the grammars and the renderer this wraps.
 */

import type { Contender } from "../../contenders.ts";
import {
  lezerHtml,
  LEZER,
  LEZER_GRAMMARS,
  type LezerGrammar,
  type LezerName,
} from "./lezer-grammars.ts";

export const lezer: Contender = {
  name: "lezer",
  grammar: (lang) => LEZER[lang] ?? undefined,
  // the cast is the map above being narrower than this signature, the same
  // way Speed Highlight's is: `grammar` returned one of its keys
  html: (code, grammar) => lezerHtml(code, LEZER_GRAMMARS[grammar as LezerName].parser),
  // `@lezer/common`, `@lezer/highlight` and `@lezer/lr` are the runtime every
  // grammar is generated against, not grammars
  carries: /\/@lezer\/(?!(?:common|highlight|lr)\/)[^/]+\/dist\/index\.c?js$/,
  // no registry and no highlighter: a parser is a module that exports one,
  // and what a consumer assembles is the map from their name for a language
  // to the parser they imported for it — which is the one below, built out of
  // the same expressions this process runs
  ship: (grammars) => {
    const chosen: LezerGrammar[] = grammars.map((g) => LEZER_GRAMMARS[g as LezerName]),
      imports = new Set(
        chosen.flatMap((g) => [
          ...g.from.map(
            (pkg) => `import { parser as ${pkg.slice("@lezer/".length)} } from "${pkg}";`,
          ),
          ...(g.imports ? [g.imports] : []),
        ]),
      );

    return `import { classHighlighter, highlightCode } from "@lezer/highlight";
${[...imports].join("\n")}

const parsers = {
${grammars.map((g, i) => `  ${JSON.stringify(g)}: ${chosen[i]!.expr},`).join("\n")}
};

export default (code, lang) => {
  let out = "";

  highlightCode(
    code,
    parsers[lang].parse(code),
    classHighlighter,
    (text, classes) => {
      const escaped = /[&<>]/.test(text)
        ? text.replaceAll("&", "&#38;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
        : text;

      out += classes ? \`<span class="\${classes}">\${escaped}</span>\` : escaped;
    },
    () => {
      out += "\\n";
    },
  );

  return out;
};`;
  },
};
