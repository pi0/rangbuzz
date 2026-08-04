/** Prism, matching with the hand written regex grammars `refractor` also runs. */

import { createRequire } from "node:module";

import Prism from "prismjs";

import { JUDGED } from "../../../../test/languages/_judges.ts";
import { CORPUS } from "../../../_corpus.ts";
import type { Contender } from "../../contenders.ts";

// no types ship with the component loader, and it is the supported way to
// register a grammar outside a browser
createRequire(import.meta.url)("prismjs/components/index.js")(
  CORPUS.flatMap((c) => JUDGED[c.lang]?.prism ?? []),
);

/**
 * Every Prism component a grammar needs, its dependencies first.
 *
 * Prism's grammars extend one another — JavaScript is `clike` with more rules,
 * TypeScript is JavaScript with more again — and a component file assumes the
 * ones it builds on are already loaded. `loadLanguages()` walks that graph for
 * the benchmark; here the same graph is walked over `components.json`, its own
 * manifest, so the bundle carries what the run carried and not one file less.
 *
 * @param grammars The components asked for
 * @returns Them and everything they need, in load order
 */
const prismComponents = (grammars: string[]): string[] => {
  const { languages } = createRequire(import.meta.url)("prismjs/components.json") as {
    languages: Record<string, { require?: string | string[]; modify?: string | string[] }>;
  };

  const order: string[] = [],
    seen = new Set<string>(),
    walk = (name: string) => {
      if (seen.has(name)) return;
      seen.add(name);

      const { require = [], modify = [] } = languages[name] ?? {};
      for (const dep of [require, modify].flat()) walk(dep);
      order.push(name);
    };

  for (const grammar of grammars) walk(grammar);
  return order;
};

export const prism: Contender = {
  name: "prism",
  grammar: (lang) => JUDGED[lang]?.prism,
  html: (code, lang) => Prism.highlight(code, Prism.languages[lang]!, lang),
  carries: /\/prismjs\/components\/prism-[^/]+\.js$/,
  // a component registers itself on the `Prism` its core puts in scope, which
  // is why they are imported for their side effect and never bound
  ship: (grammars) =>
    `import Prism from "prismjs";
${prismComponents(grammars)
  .map((g) => `import "prismjs/components/prism-${g}.js";`)
  .join("\n")}

export default (code, lang) => Prism.highlight(code, Prism.languages[lang], lang);`,
};
