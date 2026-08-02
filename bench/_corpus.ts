/**
 * The benchmark corpus: the language test suite, read as data.
 *
 * Every `test/languages/<lang>.test.ts` hands `testLanguage()` a corpus of
 * snippets keyed by what they are there to cover — the comments, the strings,
 * the numbers, the keywords, the one awkward construct that grammar has. That
 * is as close to a representative document as each grammar gets, it is already
 * maintained, and it grows whenever a grammar does, so the benchmark reads it
 * instead of keeping a second corpus that would quietly drift out of date.
 *
 * The test files cannot simply be imported: `_harness.ts` calls `describe()`,
 * which throws outside a Vitest runner. So a resolve hook points their
 * `./_harness.ts` import at `_collect.ts`, whose `testLanguage()` records the
 * corpus and does nothing else — no suite is registered and no assertion runs.
 * Nothing in `test/` knows about any of this, which is the point: the corpus
 * stays owned by the tests.
 *
 * A corpus stays a *list* of snippets and is never joined into one document.
 * The snippets are independent, and several of them end mid construct on
 * purpose — an unterminated string, a raw string delimiter, a comment left
 * open. Concatenated, one of those swallows everything after it and the
 * grammar tokenizes a couple of kilobytes as a single token: C# drops from
 * ~700 tokens to 15 that way, and reads ten times faster for it. Each snippet
 * is highlighted on its own, which is also how a code block is highlighted in
 * the first place.
 */

import { readdirSync } from "node:fs";
import { registerHooks } from "node:module";
import { parseArgs } from "node:util";

import { languages } from "../src/languages.ts";
import type { ShjLanguage } from "../src/types.ts";
import { collected } from "./_collect.ts";

/** One language's test corpus */
export interface Corpus {
  /** The language, as registered in `src/languages.ts` */
  lang: ShjLanguage;
  /** Its snippets, each meant to be highlighted on its own */
  snippets: string[];
  /** Total size of {@link Corpus.snippets} in bytes */
  bytes: number;
}

const dir = new URL("../test/languages/", import.meta.url),
  harness = new URL("_harness.ts", dir).href,
  collector = new URL("./_collect.ts", import.meta.url).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    const resolved = nextResolve(specifier, context);
    return resolved.url == harness ? { url: collector, shortCircuit: true } : resolved;
  },
});

// `registry.test.ts` is the odd one out: it asserts over the directory rather
// than declaring a corpus, and it reaches for Vitest itself.
for (const file of readdirSync(dir)
  .filter((f) => f.endsWith(".test.ts") && f != "registry.test.ts")
  .sort())
  await import(new URL(file, dir).href);

/**
 * Every bundled language that has a corpus, in registry order.
 *
 * The fragment grammars (`todo`, `js_template_literals`) have no test file of
 * their own — they are reached only through the `sub` of another language, so
 * they are measured wherever that language is.
 */
export const CORPUS: Corpus[] = Object.keys(languages)
  .filter((lang) => collected.has(lang))
  .map((lang) => {
    const snippets = Object.values(collected.get(lang)!);
    return {
      lang: lang as ShjLanguage,
      snippets,
      bytes: snippets.reduce((sum, s) => sum + Buffer.byteLength(s), 0),
    };
  });

/** Every snippet of every language, as the arguments one call takes */
export const BLOCKS: { code: string; opt: { lang: ShjLanguage } }[] = CORPUS.flatMap((c) =>
  c.snippets.map((code) => ({ code, opt: { lang: c.lang } })),
);

/** Total size of {@link CORPUS} */
export const TOTAL_BYTES: number = CORPUS.reduce((sum, c) => sum + c.bytes, 0);

/**
 * Look one language's corpus up
 *
 * @param lang The language
 * @returns Its corpus
 */
export const corpusOf = (lang: string): Corpus => {
  const found = CORPUS.find((c) => c.lang == lang);
  if (!found) throw new Error(`no corpus for "${lang}"`);
  return found;
};

/**
 * The corpora named with `--lang`, if any.
 *
 * `--lang js`, `--lang js,ts` and `--lang js --lang ts` all work.
 *
 * Without it a benchmark measures every grammar in a single pass, which is the
 * number worth watching when the question is whether a change made the library
 * slower. With it, each grammar named gets a benchmark of its own, which is the
 * number worth reading when the question is which grammar — a run nobody wants
 * to sit through, or scroll, to answer the first question.
 */
export const PICKED: Corpus[] | undefined = (() => {
  // `strict: false`: `--lang` is the only flag every benchmark shares, and one
  // of them takes flags of its own that this module has no business knowing
  // about — see `flag()` below
  const { lang } = parseArgs({
      strict: false,
      options: { lang: { type: "string", multiple: true } },
    }).values as { lang?: string[] },
    named = lang
      ?.flatMap((l) => l.split(","))
      .map((l) => l.trim())
      .filter(Boolean);

  return named?.length ? named.map(corpusOf) : undefined;
})();

/**
 * Read a flag off the command line, `--name value` or `--name=value`
 *
 * A benchmark that takes an option of its own reads it through this rather than
 * parsing the command line a second time: {@link PICKED} above already parsed
 * it, and the two would have to agree on every flag either of them knows.
 *
 * @param name The flag, without its dashes
 * @returns Its value, or `undefined` if it was not given
 */
export const flag = (name: string): string | undefined => {
  const argv = process.argv.slice(2),
    at = argv.indexOf(`--${name}`);

  if (at >= 0) return argv[at + 1]?.startsWith("--") ? undefined : argv[at + 1];
  return argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
};

/**
 * Repeat a corpus's snippets until they total at least `bytes`
 *
 * A test corpus is a few hundred bytes, which is the size of a code block in a
 * readme and worth measuring as it is — but at that size the measurement is
 * partly per call overhead, and the corpora differ in length by a factor of
 * twenty, so the raw numbers say more about which test file is longest than
 * about which grammar is fast. Repeating every language out to the same total
 * is what makes them comparable.
 *
 * @param corpus The corpus to repeat
 * @param bytes The total length to reach
 * @returns The snippets, repeated in order
 */
export const scale = (corpus: Corpus, bytes: number): string[] =>
  Array.from({ length: Math.ceil(bytes / corpus.bytes) }, () => corpus.snippets).flat();

/**
 * Repeat a single snippet until it is at least `bytes` long
 *
 * The one place a corpus is glued together rather than kept as blocks, and it
 * takes a single snippet for it: repeating one self contained snippet keeps
 * the input valid, where concatenating different ones does not.
 *
 * @param code The snippet to repeat
 * @param bytes The length to reach
 * @returns The repeated snippet
 */
export const grow = (code: string, bytes: number): string =>
  `${code}\n\n`.repeat(Math.ceil(bytes / (code.length + 2)));

/**
 * The longest snippet of a corpus, as the one to {@link grow}
 *
 * @param corpus The corpus
 * @returns Its longest snippet
 */
export const longest = (corpus: Corpus): string =>
  corpus.snippets.reduce((a, b) => (b.length > a.length ? b : a));

/**
 * Format a byte count the way the benchmark labels it
 *
 * @param bytes The byte count
 * @returns `"812 B"`, `"1.2 kB"` or `"3.2 MB"`, whichever the count reaches
 */
export const size = (bytes: number): string =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} kB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
