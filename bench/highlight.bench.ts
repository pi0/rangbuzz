/**
 * How fast the library turns code into HTML — `pnpm bench`.
 *
 * Everything here is `codeToHtml`, the whole job: tokens, escaping, the inlined
 * `style` attributes and the block around them. The layers under it are not
 * measured against it — `tokenize` does a subset of the work `highlightText`
 * does, and putting the two side by side reads as a comparison when it is only
 * a subtraction.
 *
 * Three questions, in the order they are worth asking:
 *
 * 1. **grammars** — how fast are they? One benchmark, every grammar in a pass,
 *    each corpus repeated out to the same 16 kB so no language counts for more
 *    than another. That is the number to watch across a change. Naming one with
 *    `--lang js` (or `--lang js,ts`, or `--lang js --lang ts`) splits the group
 *    back into a benchmark per grammar and plots them against each other, which
 *    is how to find out *which* grammar: one far off the pack has a rule that
 *    backtracks, or a `sub` that re-enters the engine too often.
 * 2. **options** — what the defaults cost, which is a real comparison because
 *    every row is the same call: the line-number gutter, and inlining a
 *    light/dark pair as `light-dark()` rather than a single theme.
 * 3. **scale** — one snippet, from 1 kB to 256 kB. The per byte cost should be
 *    flat; a curve that bends upward is a rule whose cost is not linear in the
 *    length of its input, which is the failure mode that turns a highlighter
 *    into a hang.
 *
 * 2 runs over the corpus as it stands — every snippet of every language, a few
 * hundred bytes each, which is what a page of documentation actually looks like
 * and where per call overhead is visible. 1 and 3 run over repeated input,
 * where it is not. `--lang` narrows 1 and nothing else: the other two are about
 * the library rather than about a grammar.
 *
 * Every snippet is highlighted on its own; see `_corpus.ts` for why they are
 * never glued together.
 *
 * This measures `src/`, not `dist/`: the benchmark is here to be run against a
 * change, and a build step between the edit and the number is a build step that
 * gets skipped. The bundler only strips the types and inlines the token
 * constants, so the shape of the result is the same.
 */

import { barplot, bench, boxplot, compact, do_not_optimize, group, run, summary } from "mitata";

import { codeToHtml } from "../src/index.ts";
import { githubDark } from "../src/themes/index.ts";
import type { ShjLanguage, ShjOptions } from "../src/types.ts";
import {
  BLOCKS,
  corpusOf,
  CORPUS,
  grow,
  longest,
  PICKED,
  scale,
  size,
  TOTAL_BYTES,
} from "./_corpus.ts";

/** The total length every corpus is repeated out to before grammars compare */
const BLOCK = 16 * 1024;

/** The bag a parameterized benchmark reads its argument from (mitata keeps its own type to itself) */
type State<T> = { get: (name: string) => T };

/** `codeToHtml` over every block of the corpus, the way a page of docs would */
const eachBlock = (opt?: ShjOptions) => () => {
  for (const b of BLOCKS) do_not_optimize(codeToHtml(b.code, { ...b.opt, ...opt }));
};

console.log(
  `corpus: ${CORPUS.length} languages, ${BLOCKS.length} blocks, ${size(TOTAL_BYTES)} total\n`,
);

// One line per benchmark: even one grammar per line, `--lang` over the whole
// registry is a screenful, and a histogram each would be four. The plots below
// carry the shape instead.
compact(() => {
  const picked = PICKED;

  if (picked)
    barplot(() => {
      group(`grammars (${size(BLOCK)} each)`, () => {
        bench("$lang", function* (state: State<ShjLanguage>) {
          const lang = state.get("lang"),
            blocks = scale(corpusOf(lang), BLOCK);

          yield () => {
            for (const code of blocks) do_not_optimize(codeToHtml(code, { lang }));
          };
        }).args(
          "lang",
          picked.map((c) => c.lang),
        );
      });
    });
  else
    group("grammars", () => {
      bench(`every grammar (${size(BLOCK)} each)`, function* () {
        const passes = CORPUS.map((c) => ({ lang: c.lang, blocks: scale(c, BLOCK) }));

        yield () => {
          for (const { lang, blocks } of passes)
            for (const code of blocks) do_not_optimize(codeToHtml(code, { lang }));
        };
      });
    });

  summary(() => {
    group(`options (whole corpus, ${size(TOTAL_BYTES)})`, () => {
      bench("default", eachBlock()).baseline(true);
      bench("lineNumbers: false", eachBlock({ lineNumbers: false }));
      bench("single theme", eachBlock({ theme: githubDark }));
    });
  });

  boxplot(() => {
    group("scale (one js snippet)", () => {
      const js = longest(corpusOf("js"));

      bench("codeToHtml $bytes B", function* (state: State<number>) {
        const code = grow(js, state.get("bytes"));
        yield () => do_not_optimize(codeToHtml(code, { lang: "js" }));
      }).range("bytes", 1024, 256 * 1024, 4);
    });
  });
});

await run();
