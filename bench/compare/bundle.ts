/**
 * What each contender weighs once the corpus benchmark is done: bundle it for
 * a browser, weigh it minified and gzipped, and time both the build and a cold
 * start. See `compare.bench.ts` for how the sizes below are read.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

import { rolldown } from "rolldown";

/** The package root, which is where a bare specifier has to resolve from */
const ROOT = fileURLToPath(new URL("../../", import.meta.url));

const VIRTUAL_ENTRY = "\0compare-entry";

/**
 * Bundle one contender's entry for a browser
 *
 * Minified, which is what a reader downloads, and by one function for all five
 * so that no part of the difference is a difference in how it was built. What
 * comes out is both what the size is taken over and what the cold start is
 * timed on, so the two columns cannot describe different artifacts.
 *
 * @param source The module to bundle, from `Contender.ship`
 * @returns Its chunks, code split or not
 */
export const build = async (source: string) => {
  const bundle = await rolldown({
    input: VIRTUAL_ENTRY,
    cwd: ROOT,
    platform: "browser",
    logLevel: "silent",
    plugins: [
      {
        name: "compare-entry",
        resolveId: (id) => (id == VIRTUAL_ENTRY ? id : undefined),
        load: (id) => (id == VIRTUAL_ENTRY ? source : undefined),
      },
    ],
  });

  const { output } = await bundle.generate({ format: "esm", minify: true });
  await bundle.close();

  return output.filter((chunk) => chunk.type == "chunk");
};

/** What {@link build} hands back */
export type Chunks = Awaited<ReturnType<typeof build>>;

/** One contender's sizes and timings, ready for the table */
export interface Weighed {
  name: string;
  mine?: true;
  min: number;
  gzip: number;
  grammars: number;
  built: number;
  warmup: number;
}

/**
 * Weigh a bundle, minified and gzipped, and count the grammars it ended up with
 *
 * Both sizes, because they answer different questions: gzipped is what crosses
 * the network, minified is what the browser then has to parse and hold, and the
 * ratio between them is not the same for a table of colours as it is for code.
 *
 * The grammars are counted off the modules that came out rather than assumed
 * from what was asked for, so a grammar dragged in by another is in the number
 * the same way it is in the bytes.
 *
 * @param chunks The bundle, from {@link build}
 * @param carries Which of its modules is a grammar, from `Contender.carries`
 * @param inlined Read `carries` over the code instead, from `Contender.inlined`
 * @returns Its sizes, in bytes, and how many grammars it carries
 */
export const weigh = (
  chunks: Chunks,
  carries: RegExp,
  inlined?: true,
): { min: number; gzip: number; grammars: number } => ({
  min: chunks.reduce((sum, chunk) => sum + Buffer.byteLength(chunk.code), 0),
  gzip: gzipSync(chunks.map((chunk) => chunk.code).join(""), { level: 9 }).length,
  grammars: new Set(
    inlined
      ? chunks.flatMap((chunk) => chunk.code.match(carries) ?? [])
      : chunks
          .flatMap((chunk) => Object.keys(chunk.modules))
          // the ids are paths, and `carries` is written with `/` in it
          .map((id) => id.replaceAll(sep, "/"))
          .filter((id) => carries.test(id)),
  ).size,
});

/** How many times a cold start is taken, of which the best one counts */
const COLD_RUNS = 3;

/** The module a cold start is timed on, which imports the bundle beside it */
const RUNNER = "warmup.mjs";

/**
 * Write a set of modules out and time a fresh process evaluating {@link RUNNER}
 *
 * `performance.now()` in Node counts from the moment the process started, so
 * what the runner prints is everything the bundle cost: reading it, parsing it,
 * running it, and whatever it awaited at the top level. The best of
 * {@link COLD_RUNS}, since everything that perturbs a cold start makes it
 * slower.
 *
 * On disk rather than through `-e`, which cannot carry an argument the size of
 * Shiki's bundle, and in a temporary directory rather than the package, so
 * nothing resolves out of `node_modules` by accident — a bundle has no bare
 * specifiers left to resolve.
 *
 * @param files The modules to write, keyed by file name
 * @returns Milliseconds from the start of the process to the end of the runner
 */
const evaluate = (files: Record<string, string>): number => {
  const dir = mkdtempSync(join(tmpdir(), "rangi-warmup-"));

  try {
    for (const [name, code] of Object.entries(files)) writeFileSync(join(dir, name), code);

    return Math.min(
      ...Array.from({ length: COLD_RUNS }, () =>
        Number(
          execFileSync(process.execPath, [join(dir, RUNNER)], {
            // a warning on stderr is passed through rather than read as the answer
            encoding: "utf8",
            stdio: ["ignore", "pipe", "inherit"],
          }).trim(),
        ),
      ),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

/**
 * What a process costs before it has imported anything.
 *
 * Subtracted from every measurement, so a row is the library warming up and not
 * Node starting.
 */
const BOOT = evaluate({ [RUNNER]: "console.log(performance.now());" });

/**
 * How long a contender takes to go from nothing to ready to highlight
 *
 * It cannot be measured in the process running the corpus benchmark. `_judges.ts`
 * imports Shiki for the test suite's oracle, so it is loaded before a single
 * contender is built; our own registry and themes arrive with the corpus; and
 * one process can only load `shiki` once, so of the two engines whichever went
 * second would be timed against a module cache the first one filled. Every
 * number would be a different fraction of the truth, and the order the corpus
 * benchmark's contenders happen to run in would decide which.
 *
 * So it is timed from cold, in a process with nothing loaded, on the bundle the
 * row is weighed over — whose evaluation ends with a highlighter built and a
 * function ready to be called. That the bundle and not the source is what runs
 * matters for us more than for anyone: `src/` is forty-odd TypeScript files
 * that Node would strip one by one, twenty times what the built entry costs,
 * where every other contender loads JavaScript that was built before it was
 * published.
 *
 * Two things it cannot capture, both of them the same shape: highlight.js
 * compiles a grammar the first time it is asked for it rather than at
 * registration, and Speed Highlight builds a sub-language's rules the first
 * time a line of code reaches it, which asking for the language itself does not
 * do. So part of each one's warmup is paid inside the corpus benchmark instead
 * of here — and in Speed Highlight's case it is the part that a grammar with a
 * sub-language, which is most of the interesting ones, would pay.
 *
 * @param chunks The bundle, from {@link build}
 * @returns Milliseconds, with {@link BOOT} taken off
 */
export const cold = (chunks: Chunks): number =>
  Math.max(
    0,
    evaluate({
      ...Object.fromEntries(chunks.map((chunk) => [chunk.fileName, chunk.code])),
      [RUNNER]: `import ${JSON.stringify(
        `./${chunks.find((chunk) => chunk.isEntry)!.fileName}`,
      )};\nconsole.log(performance.now());`,
    }) - BOOT,
  );
