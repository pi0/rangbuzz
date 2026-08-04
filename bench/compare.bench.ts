/**
 * The same corpus through the other highlighters — `pnpm bench:compare`.
 *
 * Shiki, Prism, highlight.js, Lezer and Speed Highlight, against us. Shiki twice: once
 * on Oniguruma compiled to WebAssembly, which is what it uses unless told
 * otherwise, and once on [its JavaScript `RegExp` engine][engine], which trades
 * some grammar compatibility for not shipping the WebAssembly — the comparison
 * closest to ours, since that engine and this library are running the same
 * primitive. Strict, not `forgiving`: every grammar the corpus needs compiles
 * under it, so nothing here is being highlighted by a pattern that was quietly
 * given up on.
 *
 * Lezer is the third design in the table and the only one that is not matching
 * patterns at all: every grammar is an LR parser generated from a grammar file,
 * it builds a syntax tree of the block and the colours fall out of the tree's
 * node types. It is what CodeMirror 6 highlights with, which is what makes it
 * worth the row — a parser is the other end of the trade this library sits at,
 * and it is the end that knows what a token *is*. Measured through
 * `@lezer/highlight`'s `highlightCode()`, the entry point it publishes for
 * rendering outside an editor, and with the tree thrown away after every block:
 * incremental reparsing is Lezer's reason to exist and none of it applies to a
 * code block that is highlighted once and never edited.
 *
 * Speed Highlight is the project this one is a fork of, and so is the one row
 * that answers what the fork did rather than what a different design costs: its
 * grammars are the ancestors of ours and its output is token for token the same
 * shape. It is measured as it ships, which means `highlightText()` and means
 * awaiting it — its tokenizer is an `async function` that awaits itself through
 * every sub-language, so the promise is not a detail of how a grammar is
 * loaded, it is in the call every one of its users makes. Being synchronous is
 * most of what this fork is, so that await is inside the timing rather than
 * around it.
 *
 * The point is not a headline number, it is a fair one, so what is measured is
 * spelled out:
 *
 * - **Same input.** Every contender gets the exact snippets of
 *   `test/languages/`, block by block. The default run uses only the languages
 *   every contender has a grammar for, so the totals are over identical bytes;
 *   the count it prints is of those, not of the corpus. `--lang` is how to see
 *   one of the languages that misses the cut, against whoever does have it —
 *   which is most of them, since Lezer and Speed Highlight between them decide
 *   that set and neither has a `bash` or a `toml`.
 * - **Same call.** One string of code in, one string of HTML out, synchronous.
 *   Shiki is measured through `highlighter.codeToHtml()`, its synchronous
 *   method, not the top level one that loads a grammar on demand and returns a
 *   promise.
 * - **Two outputs, and a row each.** We and Shiki inline the theme as `style`
 *   attributes: the result needs no stylesheet, and both pay for the colour
 *   lookup and the attribute on every token. Prism, highlight.js, Lezer and
 *   Speed Highlight emit class names and leave the colours to a stylesheet you
 *   ship separately, which is strictly less work per token. So there are two
 *   rows of ours rather than one caveat: `rangi` is the default, inlined, to be
 *   read against Shiki; `rangi (classes)` is the same call with `classes: true`,
 *   emitting the same shape of markup the other four do and looking up no
 *   colour either, to be read against them. Nobody's numbers need discounting
 *   by hand. Escaping is the one thing that shape does not settle: everyone
 *   else does it inside the call, `@lezer/highlight` hands the text back raw
 *   and leaves it to whoever is building the markup, so it is done there too —
 *   the same three characters, inside the timing.
 * - **Warm.** Every contender is fully loaded before the timer starts — Shiki's
 *   grammars and theme compiled into the highlighter, Prism's components
 *   loaded, highlight.js imported, Lezer's dialects and its HTML nesting
 *   configured into parsers, Speed Highlight's grammars pulled into the cache
 *   it loads them through. What each of them spent getting there is a
 *   column of the table at the end, because it is real cost that a benchmark
 *   like this hides: we have almost none of it, the registry is a static
 *   object, and everyone else pays it once per process. It is timed from cold
 *   in a process of its own rather than here, which is the only way to get it
 *   honestly — see `cold()` in `bench/compare/bundle.ts`.
 * - **Nobody as the baseline.** The summary is measured from whichever row came
 *   out fastest rather than from ours, so the ordering is the run's and not a
 *   frame we chose. The bundle table below it does anchor on our default row,
 *   because a size is only interesting as a multiple of something and there it
 *   is the thing being explained. Ours runs with `lineNumbers: false`, which is
 *   the closest our markup gets to theirs, and `github-dark` on both sides that
 *   have a theme.
 * - **What it weighs, once the timings are in.** Each contender is then bundled
 *   for the browser out of the very call the benchmark just ran — same
 *   grammars, same theme, same entry points its own documentation says to ship
 *   — by one function, so the sizes are comparable even where the numbers on
 *   their websites are not. That one bundle answers the rest of the table:
 *   minified and gzipped it is what a page downloads and parses, timing the
 *   build is what a project's CI pays for it, and evaluating it in a process of
 *   its own is what the page waits through before the first token is coloured.
 *   Ours is the odd one out and it counts against us: the main entry carries
 *   the registry whole, so our row pays for every grammar we have while
 *   everyone else pays only for the ones this run compares. `rangi/core` is
 *   the entry that undoes that, and it is deliberately not what is weighed
 *   here. How many grammars that came to is
 *   counted off the bundle rather than off the list each contender was handed,
 *   because a grammar that embeds another brings it along: ask Shiki for `html`
 *   and JavaScript and CSS arrive with it, ask Prism for `typescript` and
 *   `clike` does.
 *
 * Which grammar each highlighter is asked for comes from one map per contender:
 * Shiki's and Prism's are the ones the test suite already keeps in
 * `test/languages/_judges.ts`, so the comparison cannot pair a language with
 * the wrong grammar; `HLJS`, `SPEED` and `LEZER` in `bench/compare/contenders/`
 * are the other three, and are keyed by `ShjLanguage` so adding a language
 * fails typecheck until it is decided.
 *
 * These are not the same tool and the numbers should not be read as if they
 * were. Shiki runs the TextMate grammars VS Code itself runs and Lezer runs a
 * real parser per language; both are more accurate than a few hundred regexes
 * can be, and Lezer's coverage is short here for the same reason it is
 * accurate — a grammar has to be written whole before it exists at all. It is
 * fair to say we are faster and smaller. It is not fair to leave out what that
 * costs.
 *
 * [engine]: https://shiki.style/guide/regex-engines#javascript-regexp-engine
 *
 * One pass over the whole shared corpus by default; `--lang js` (or
 * `--lang js,ts`) compares the grammars named, one group each, with whichever
 * contenders have that language — for when the question is where the difference
 * comes from rather than how big it is.
 *
 * The roster of contenders, the mitata run and the bundle weighing each live in
 * their own file under `bench/compare/`; this one only strings them together.
 */

import { compact, run } from "mitata";

import type { Corpus } from "./_corpus.ts";
import { CORPUS, PICKED, size } from "./_corpus.ts";
import { build, cold, weigh, type Weighed } from "./compare/bundle.ts";
import { CONTENDERS } from "./compare/contenders.ts";
import { face } from "./compare/run.ts";
import { printTable } from "./compare/table.ts";

const covers = (c: Corpus) => CONTENDERS.every((x) => x.grammar(c.lang)),
  shared = CORPUS.filter(covers),
  bytes = shared.reduce((sum, c) => sum + c.bytes, 0);

console.log(
  PICKED
    ? // per language, a group takes whoever has that grammar, so nothing is dropped
      `corpus: ${PICKED.map((c) => c.lang).join(", ")}, each against the contenders that have it\n`
    : `corpus: ${shared.length} languages every contender has, ${size(bytes)} total\n`,
);

compact(() => {
  // Same split as `pnpm bench`: one pass over everything by default, a group
  // per grammar when `--lang` asks which of them the difference is in.
  if (PICKED) for (const c of PICKED) face(`${c.lang} (${size(c.bytes)})`, [c]);
  else face(`everything (${size(bytes)})`, shared);
});

await run();

/** The corpora the run compared, which is what each bundle has to cover */
const measured = PICKED ?? shared,
  covered = measured.map((c) => c.lang);

// rolldown pays for its own start up on the first build of a process; a
// throwaway one takes that out of whichever row happens to go first
await build("export default 0;");

const weighed: Weighed[] = [];

// One contender at a time, because bundling is timed as well: eight rolldown
// builds racing each other for the same cores would be eight numbers about the
// machine rather than about the input.
for (const contender of CONTENDERS) {
  // one name can serve two of our languages — Prism highlights both HTML and
  // XML with `markup`, highlight.js both TOML and INI with `ini`
  const grammars = [
    ...new Set(covered.map((lang) => contender.grammar(lang)).filter((g) => g != null)),
  ];

  // `--lang svelte` leaves a contender with nothing to bundle, the same way it
  // leaves it out of the benchmark
  if (!grammars.length) continue;

  const source = contender.ship(grammars),
    at = performance.now(),
    chunks = await build(source),
    built = performance.now() - at;

  weighed.push({
    name: contender.name,
    mine: contender.mine,
    ...weigh(chunks, contender.carries, contender.inlined),
    built,
    warmup: cold(chunks),
  });
}

const baseline = weighed.find((w) => w.name == CONTENDERS[0]!.name),
  sorted = weighed.sort((a, b) => a.gzip - b.gzip);

printTable(sorted, baseline, PICKED, covered, measured);
