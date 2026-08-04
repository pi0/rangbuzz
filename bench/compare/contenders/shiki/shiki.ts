/**
 * What Shiki's two contenders share: the grammar it needs for the corpus, and
 * the entry point each of them ships. Each contender builds its own
 * highlighter off {@link shikiLangs} — the engine is chosen when the
 * highlighter is built, so the two cannot share one — and calls
 * {@link shikiShip} with its own engine expression.
 */

import { JUDGED } from "../../../../test/languages/_judges.ts";
import { CORPUS } from "../../../_corpus.ts";

/**
 * A Shiki entry built the fine grained way, which is the only fair one: the
 * `shiki` import the benchmark uses reaches its full bundle, several megabytes
 * of grammar it would never run, so weighing that would be measuring a mistake
 * nobody ships. This is what its documentation calls the fine-grained bundle —
 * the core, one engine, and the grammars named.
 *
 * @param engine The expression building the engine
 * @param imports What that expression needs imported
 * @returns A `Contender.ship`
 */
/**
 * Where a Shiki grammar lands, whichever engine asked for it.
 *
 * `shiki/langs/x.mjs` is a one line re-export of `@shikijs/langs`, which is
 * where the grammar itself lives and where the ones it embeds live too, so it
 * is that package the count is taken over.
 */
export const SHIKI_LANGS = /\/@shikijs\/langs\/dist\/[^/]+\.mjs$/;

export const shikiShip =
  (engine: string, imports: string) =>
  (grammars: string[]): string =>
    `import { createHighlighterCore } from "shiki/core";
${imports}
import theme from "shiki/themes/github-dark.mjs";
${grammars.map((g, i) => `import lang${i} from "shiki/langs/${g}.mjs";`).join("\n")}

const highlighter = await createHighlighterCore({
  langs: [${grammars.map((_, i) => `lang${i}`).join(", ")}],
  themes: [theme],
  engine: ${engine},
});

export default (code, lang) => highlighter.codeToHtml(code, { lang, theme: "github-dark" });`;

/** Every language the corpus asks Shiki for, in its own spelling */
export const shikiLangs = CORPUS.flatMap((c) => JUDGED[c.lang]?.shiki ?? []);
