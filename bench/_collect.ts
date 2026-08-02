/**
 * The stand-in for `test/languages/_harness.ts` the benchmark loads the corpus
 * through. See `_corpus.ts`, which installs it and reads what it collects.
 *
 * It has to be a module of its own, and one that finishes evaluating on its
 * own: a test file imports it, so anything it waits for the test files to do
 * would be a cycle waiting on itself.
 */

/** Every corpus handed to {@link testLanguage} so far, keyed by language */
export const collected = new Map<string, Record<string, string>>();

/**
 * Record one language's corpus
 *
 * The signature is the first half of the real `testLanguage()`; the divergence
 * list it also takes is a statement about correctness and says nothing about
 * speed, so it is ignored.
 *
 * @param lang The language, as registered in `src/languages.ts`
 * @param corpus Snippets keyed by what they are there to cover
 */
export function testLanguage(lang: string, corpus: Record<string, string>): void {
  collected.set(lang, corpus);
}
