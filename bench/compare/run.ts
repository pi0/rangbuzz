/**
 * Run every contender that can over one group of corpora, through mitata. See
 * `compare.bench.ts` for how the groups are chosen.
 */

import { bench, do_not_optimize, group, summary } from "mitata";

import type { Corpus } from "../_corpus.ts";
import { CONTENDERS } from "./contenders.ts";

/**
 * How our own rows are marked in the benchmarks.
 *
 * The table at the end paints the baseline as a rainbow; mitata cannot, since
 * `highlight` takes one colour for the whole label and puts it in front of the
 * text rather than through it. So both of our rows get the one colour nothing
 * else in its output uses — the numbers are yellow, the names are plain, the
 * notes are grey.
 */
export const SELECTION = "magenta";

/**
 * Every contender over the same corpora, ours first and nominated for nothing
 *
 * Only the ones with a grammar for every language in `corpora` take part, so a
 * group is always a comparison over identical bytes.
 */
export const face = (name: string, corpora: Corpus[]) => {
  const running = CONTENDERS.filter((x) => corpora.every((c) => x.grammar(c.lang)));

  group(name, () => {
    summary(() => {
      for (const contender of running) {
        const blocks = corpora.flatMap((c) =>
          c.snippets.map((code) => ({ code, grammar: contender.grammar(c.lang)! })),
        );

        bench(
          contender.name,
          contender.awaits
            ? async () => {
                for (const b of blocks) do_not_optimize(await contender.html(b.code, b.grammar));
              }
            : () => {
                for (const b of blocks) do_not_optimize(contender.html(b.code, b.grammar));
              },
        )
          // no `.baseline()`: mitata then measures its summary from whichever
          // row came out fastest, which is the ordering worth reading and one
          // we do not get to nominate ourselves for
          .highlight(contender.mine ? SELECTION : undefined);
      }
    });
  });
};
