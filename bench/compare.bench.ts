/**
 * The same corpus through the other highlighters — `pnpm bench:compare`.
 *
 * Shiki, Prism and highlight.js, against us. Shiki twice: once on Oniguruma
 * compiled to WebAssembly, which is what it uses unless told otherwise, and
 * once on [its JavaScript `RegExp` engine][engine], which trades some grammar
 * compatibility for not shipping the WebAssembly — the comparison closest to
 * ours, since that engine and this library are running the same primitive.
 * Strict, not `forgiving`: every grammar the corpus needs compiles under it, so
 * nothing here is being highlighted by a pattern that was quietly given up on.
 *
 * The point is not a headline number, it is a fair one, so what is measured is
 * spelled out:
 *
 * - **Same input.** Every contender gets the exact snippets of
 *   `test/languages/`, block by block. The default run uses only the languages
 *   every contender has a grammar for, so the totals are over identical bytes;
 *   the count it prints is of those, not of the corpus. `--lang` is how to see
 *   one of the languages that misses the cut, against whoever does have it.
 * - **Same call.** One string of code in, one string of HTML out, synchronous.
 *   Shiki is measured through `highlighter.codeToHtml()`, its synchronous
 *   method, not the top level one that loads a grammar on demand and returns a
 *   promise.
 * - **Not the same output, and this matters.** We and Shiki inline the theme as
 *   `style` attributes: the result needs no stylesheet, and both pay for the
 *   colour lookup and the attribute on every token. Prism and highlight.js emit
 *   class names and leave the colours to a stylesheet you ship separately, so
 *   they are doing strictly less work per token. Read their numbers as a
 *   ceiling, not as a like-for-like.
 * - **Warm.** Every contender is fully loaded before the timer starts — Shiki's
 *   grammars and theme compiled into the highlighter, Prism's components
 *   loaded, highlight.js imported. What each of them spent getting there is a
 *   column of the table at the end, because it is real cost that a benchmark
 *   like this hides: we have almost none of it, the registry is a static
 *   object, and everyone else pays it once per process. It is timed from cold
 *   in a process of its own rather than here, which is the only way to get it
 *   honestly — see {@link cold}.
 * - **Ours as the baseline**, with `lineNumbers: false`, which is the closest
 *   our markup gets to theirs, and `github-dark` on both sides that have a
 *   theme.
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
 *   everyone else pays only for the ones this run compares. `rangbuzz/core` is
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
 * the wrong grammar; {@link HLJS} below is the third, and is keyed by
 * `ShjLanguage` so adding a language fails typecheck until it is decided.
 *
 * These are not the same tool and the numbers should not be read as if they
 * were. Shiki runs the TextMate grammars VS Code itself runs and is more
 * accurate than a few hundred regexes can be. It is fair to say we are faster
 * and smaller. It is not fair to leave out what that costs.
 *
 * [engine]: https://shiki.style/guide/regex-engines#javascript-regexp-engine
 *
 * One pass over the whole shared corpus by default; `--lang js` (or
 * `--lang js,ts`) compares the grammars named, one group each, with whichever
 * contenders have that language — for when the question is where the difference
 * comes from rather than how big it is.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { styleText } from "node:util";
import { gzipSync } from "node:zlib";

import hljs from "highlight.js";
import { bench, compact, do_not_optimize, group, run, summary } from "mitata";
import Prism from "prismjs";
import { rolldown } from "rolldown";
import { createHighlighter } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

import { codeToHtml } from "../src/index.ts";
import { githubDark } from "../src/themes/index.ts";
import type { ShjLanguage } from "../src/types.ts";
import { JUDGED } from "../test/languages/_judges.ts";
import { type Corpus, CORPUS, PICKED, size } from "./_corpus.ts";

/**
 * Our language -> the grammar highlight.js knows it by, `null` where it has
 * none.
 *
 * `toml` is not a mistake: highlight.js highlights TOML with its INI grammar,
 * under an alias, and that is the grammar a user of it gets.
 */
const HLJS: Record<ShjLanguage, string | null> = {
  asm: "x86asm",
  astro: null,
  bash: "bash",
  c: "c",
  cpp: "cpp",
  cs: "csharp",
  css: "css",
  csv: null,
  dart: "dart",
  diff: "diff",
  docker: "dockerfile",
  go: "go",
  graphql: "graphql",
  html: "xml",
  http: "http",
  ini: "ini",
  java: "java",
  js: "javascript",
  jsdoc: null,
  json: "json",
  kt: "kotlin",
  less: "less",
  log: null,
  lua: "lua",
  make: "makefile",
  md: "markdown",
  php: "php",
  pl: "perl",
  plain: "plaintext",
  ps1: "powershell",
  py: "python",
  rb: "ruby",
  regex: null,
  rs: "rust",
  scss: "scss",
  sql: "sql",
  svelte: null,
  swift: "swift",
  toml: "ini",
  ts: "typescript",
  uri: null,
  vue: null,
  xml: "xml",
  yaml: "yaml",
};

/** One highlighter, asked for a string of HTML */
interface Contender {
  /** What it is called in the output */
  name: string;
  /** The grammar it knows one of our languages by, `undefined` where it has none */
  grammar: (lang: ShjLanguage) => string | undefined;
  /** Highlight one block with the grammar {@link Contender.grammar} returned */
  html: (code: string, grammar: string) => string;
  /**
   * The module a consumer bundles to get {@link Contender.html} back
   *
   * The entry points and the loading dance are each contender's own, as
   * documented by it; what they have in common is that nothing else is in
   * there, and that the module ends up doing exactly what the benchmark above
   * timed.
   *
   * @param grammars The grammars this run needs, in {@link Contender.grammar}'s
   * spelling and deduplicated — one name can serve two of our languages
   * @returns The source of the entry, as a bundler would find it on disk
   */
  ship: (grammars: string[]) => string;
  /**
   * How that contender spells a grammar, as a bundler names the module
   *
   * What the `grammars` column counts is the modules of the finished bundle
   * this matches, not the names {@link Contender.ship} was handed, because the
   * two are rarely the same number: a grammar that embeds another pulls it in
   * — Shiki's `html` brings JavaScript and CSS, Prism's `typescript` brings
   * `clike` — and ours brings the registry whole whatever it was asked for.
   */
  carries: RegExp;
}

/** The package root, which is where a bare specifier has to resolve from */
const ROOT = fileURLToPath(new URL("../", import.meta.url));

/** `src/`, as a bundler resolves it from the generated entry */
const SRC = fileURLToPath(new URL("../src/", import.meta.url));

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

/**
 * A Shiki entry built the fine grained way, which is the only fair one: the
 * `shiki` import the benchmark uses reaches its full bundle, several megabytes
 * of grammar it would never run, so weighing that would be measuring a mistake
 * nobody ships. This is what its documentation calls the fine-grained bundle —
 * the core, one engine, and the grammars named.
 *
 * @param engine The expression building the engine
 * @param imports What that expression needs imported
 * @returns A {@link Contender.ship}
 */
/**
 * Where a Shiki grammar lands, whichever engine asked for it.
 *
 * `shiki/langs/x.mjs` is a one line re-export of `@shikijs/langs`, which is
 * where the grammar itself lives and where the ones it embeds live too, so it
 * is that package the count is taken over.
 */
const SHIKI_LANGS = /\/@shikijs\/langs\/dist\/[^/]+\.mjs$/;

const shikiShip =
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

const shikiLangs = CORPUS.flatMap((c) => JUDGED[c.lang]?.shiki ?? []);

const oniguruma = await createHighlighter({ langs: shikiLangs, themes: ["github-dark"] });

// Its own highlighter rather than the singleton: the engine is chosen when the
// highlighter is built, so the two cannot share one. Strict — every grammar
// here compiles without `forgiving`, which would trade accuracy for reach.
const jsRegexp = await createHighlighter({
  langs: shikiLangs,
  themes: ["github-dark"],
  engine: createJavaScriptRegexEngine(),
});

// no types ship with the component loader, and it is the supported way to
// register a grammar outside a browser
createRequire(import.meta.url)("prismjs/components/index.js")(
  CORPUS.flatMap((c) => JUDGED[c.lang]?.prism ?? []),
);

const CONTENDERS: Contender[] = [
  {
    name: "rangbuzz",
    grammar: (lang) => lang,
    html: (code, lang) => codeToHtml(code, { lang, theme: githubDark, lineNumbers: false }),
    // the grammars are not chosen: the main entry is the registry, whichever
    // languages the run happens to compare, so this counts every one of them
    carries: /\/src\/languages\/[^/]+\.ts$/,
    ship: () =>
      `import { codeToHtml } from ${JSON.stringify(`${SRC}index.ts`)};
import { githubDark } from ${JSON.stringify(`${SRC}themes/index.ts`)};

export default (code, lang) => codeToHtml(code, { lang, theme: githubDark, lineNumbers: false });`,
  },
  {
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
  },
  {
    name: "shiki (js regexp)",
    grammar: (lang) => JUDGED[lang]?.shiki,
    html: (code, lang) => jsRegexp.codeToHtml(code, { lang, theme: "github-dark" }),
    carries: SHIKI_LANGS,
    ship: shikiShip(
      "createJavaScriptRegexEngine()",
      `import { createJavaScriptRegexEngine } from "shiki/engine/javascript";`,
    ),
  },
  {
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
  },
  {
    // its own grammars decide what is illegal, and a corpus of fragments trips
    // that on purpose; `ignoreIllegals` is the path its own auto-detection takes
    name: "highlight.js",
    grammar: (lang) => HLJS[lang] ?? undefined,
    html: (code, lang) => hljs.highlight(code, { language: lang, ignoreIllegals: true }).value,
    // `es/` is where a browser resolves them; the CommonJS `lib/` is the same
    // grammars, and the pattern takes either so the count does not depend on
    // which one the bundler picked
    carries: /\/highlight\.js\/(?:es|lib)\/languages\/[^/]+\.js$/,
    // `lib/core` and a grammar per language: the default entry is the "common"
    // bundle, forty odd grammars whether or not they are used
    ship: (grammars) =>
      `import hljs from "highlight.js/lib/core";
${grammars.map((g, i) => `import lang${i} from "highlight.js/lib/languages/${g}";`).join("\n")}

${grammars.map((g, i) => `hljs.registerLanguage(${JSON.stringify(g)}, lang${i});`).join("\n")}

export default (code, lang) => hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;`,
  },
];

/**
 * Every contender over the same corpora, ours first and as the baseline
 *
 * Only the ones with a grammar for every language in `corpora` take part, so a
 * group is always a comparison over identical bytes.
 */
/**
 * How our own row is marked in the benchmarks.
 *
 * The table at the end paints it as a rainbow; mitata cannot, since `highlight`
 * takes one colour for the whole label and puts it in front of the text rather
 * than through it. So the row gets the one colour nothing else in its output
 * uses — the numbers are yellow, the names are plain, the notes are grey.
 */
const SELECTION = "magenta";

const face = (name: string, corpora: Corpus[]) => {
  const running = CONTENDERS.filter((x) => corpora.every((c) => x.grammar(c.lang)));

  group(name, () => {
    summary(() => {
      for (const contender of running) {
        const ours = contender == CONTENDERS[0],
          blocks = corpora.flatMap((c) =>
            c.snippets.map((code) => ({ code, grammar: contender.grammar(c.lang)! })),
          );

        bench(contender.name, () => {
          for (const b of blocks) do_not_optimize(contender.html(b.code, b.grammar));
        })
          .baseline(ours)
          .highlight(ours ? SELECTION : undefined);
      }
    });
  });
};

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

// The one caveat that changes how a row is read, so it goes with the rows
// rather than only in the comment at the top of this file — and under them
// rather than over them, where it would be read before there was anything to
// apply it to.
console.log(
  "\nnote: prism and highlight.js emit class names where we and shiki inline the theme," +
    "\n      so they do less work per token and need a stylesheet shipped with the page",
);

const VIRTUAL_ENTRY = "\0compare-entry";

/**
 * Bundle one contender's entry for a browser
 *
 * Minified, which is what a reader downloads, and by one function for all five
 * so that no part of the difference is a difference in how it was built. What
 * comes out is both what the size is taken over and what the cold start is
 * timed on, so the two columns cannot describe different artifacts.
 *
 * @param source The module to bundle, from {@link Contender.ship}
 * @returns Its chunks, code split or not
 */
const build = async (source: string) => {
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
type Chunks = Awaited<ReturnType<typeof build>>;

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
 * @param carries Which of its modules is a grammar, from
 * {@link Contender.carries}
 * @returns Its sizes, in bytes, and how many grammars it carries
 */
const weigh = (
  chunks: Chunks,
  carries: RegExp,
): { min: number; gzip: number; grammars: number } => ({
  min: chunks.reduce((sum, chunk) => sum + Buffer.byteLength(chunk.code), 0),
  gzip: gzipSync(chunks.map((chunk) => chunk.code).join(""), { level: 9 }).length,
  grammars: new Set(
    chunks
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
  const dir = mkdtempSync(join(tmpdir(), "rangbuzz-warmup-"));

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
 * It cannot be measured in this process. `_judges.ts` imports Shiki for the
 * test suite's oracle, so it is loaded before the first line here runs; our own
 * registry and themes arrive with the corpus; and one process can only load
 * `shiki` once, so of the two engines whichever went second would be timed
 * against a module cache the first one filled. Every number would be a
 * different fraction of the truth, and the order of this file would decide
 * which.
 *
 * So it is timed from cold, in a process with nothing loaded, on the bundle the
 * row is weighed over — whose evaluation ends with a highlighter built and a
 * function ready to be called. That the bundle and not the source is what runs
 * matters for us more than for anyone: `src/` is forty-odd TypeScript files
 * that Node would strip one by one, twenty times what the built entry costs,
 * where every other contender loads JavaScript that was built before it was
 * published.
 *
 * One thing it cannot capture: highlight.js compiles a grammar the first time
 * it is asked for it rather than at registration, so part of its own warmup is
 * paid inside the timings above instead of here.
 *
 * @param chunks The bundle, from {@link build}
 * @returns Milliseconds, with {@link BOOT} taken off
 */
const cold = (chunks: Chunks): number =>
  Math.max(
    0,
    evaluate({
      ...Object.fromEntries(chunks.map((chunk) => [chunk.fileName, chunk.code])),
      [RUNNER]: `import ${JSON.stringify(
        `./${chunks.find((chunk) => chunk.isEntry)!.fileName}`,
      )};\nconsole.log(performance.now());`,
    }) - BOOT,
  );

/** The corpora the run compared, which is what each bundle has to cover */
const measured = PICKED ?? shared,
  covered = measured.map((c) => c.lang);

// rolldown pays for its own start up on the first build of a process; a
// throwaway one takes that out of whichever row happens to go first
await build("export default 0;");

const weighed: {
  name: string;
  min: number;
  gzip: number;
  grammars: number;
  built: number;
  warmup: number;
}[] = [];

// One contender at a time, because bundling is timed as well: five rolldown
// builds racing each other for the same cores would be five numbers about the
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
    ...weigh(chunks, contender.carries),
    built,
    warmup: cold(chunks),
  });
}

const baseline = weighed.find((w) => w.name == CONTENDERS[0]!.name),
  sorted = weighed.sort((a, b) => a.gzip - b.gzip);

/**
 * A size, and what it is as a multiple of ours
 *
 * The two sizes carry a ratio each rather than sharing one column, because they
 * do not agree: a TextMate grammar is repetitive enough that Shiki gzips six
 * times over where we manage barely two, so the gap a page downloads and the
 * gap it has to parse are different numbers.
 *
 * @param bytes The size
 * @param ours The same size of our own bundle, if it is in this run
 * @returns `"98.4 kB (3.39x)"`, or just the size when there is nothing to
 * compare it against
 */
const against = (bytes: number, ours?: number) =>
  ours ? `${size(bytes)} (${(bytes / ours).toFixed(2).replace(/\.?0+$/, "")}x)` : size(bytes);

/** The table, header row first, unpainted so the columns can be measured */
const rows: string[][] = [
  ["highlighter", "min", "min+gzip", "grammars", "build", "warmup"],
  ...sorted.map((w) => [
    w.name,
    against(w.min, baseline?.min),
    against(w.gzip, baseline?.gzip),
    `${w.grammars}`,
    `${w.built.toFixed(0)} ms`,
    `${w.warmup.toFixed(0)} ms`,
  ]),
];

/** Colors, applied last: an escape sequence would count towards a column width */
type Paint = Parameters<typeof styleText>[0];

const tint = (paint: Paint, text: string) =>
  // dropped when the output is not a terminal that asked for color, which is
  // what `mitata` does with its own
  styleText(paint, text, { validateStream: true, stream: process.stdout });

/**
 * One row's cells, padded out to their columns
 *
 * The name reads as a label and everything else as a number, so the first
 * column is left aligned and the rest hang off the right.
 */
const widths = rows[0]!.map((_, i) => Math.max(...rows.map((row) => row[i]!.length))),
  laid = (row: string[]) =>
    row.map((cell, i) => (i ? cell.padStart(widths[i]!) : cell.padEnd(widths[i]!)));

/** A row, painted a column at a time */
const line = (row: string[], paint: (column: number) => Paint) =>
  `  ${laid(row)
    .map((cell, i) => tint(paint(i), cell))
    .join("   ")}`;

/** Green where we are the smaller bundle, red where we are not */
const versus = (bytes: number, ours?: number): Paint =>
  !ours || bytes == ours ? "gray" : bytes > ours ? "green" : "red";

/** How many characters a hue takes to come back round */
const RAINBOW = 40;

/**
 * The hue that far round the wheel, at full saturation and value
 *
 * `styleText` takes a hex colour and emits it as a 24 bit sequence, so the
 * colours here are the ones asked for rather than whichever nine the terminal's
 * theme happens to have been given.
 *
 * @param turn How far round, in characters
 * @returns The colour, as `styleText` takes it
 */
const hue = (turn: number): Paint => {
  // hsv -> rgb at s = v = 1, which is the outer edge of the wheel
  const channel = (n: number) => {
    const k = (((n + (turn / RAINBOW) * 6) % 6) + 6) % 6;
    return Math.round(255 * (1 - Math.max(0, Math.min(k, 4 - k, 1))))
      .toString(16)
      .padStart(2, "0");
  };

  return `#${channel(5)}${channel(3)}${channel(1)}`;
};

/**
 * Our own row, painted as a rainbow
 *
 * It is the one every other row is a multiple of, so it should be findable
 * without reading the names — and none of the rules above can mark it, because
 * every ratio in the baseline row is `1x`, which {@link versus} greys out, and
 * a grey row is the opposite of a marked one.
 *
 * A character at a time rather than a column at a time, so the hue carries
 * across the gaps between the columns and the row reads as one band instead of
 * six blocks.
 *
 * @param row The row's cells
 * @returns It, laid out and painted
 */
const rainbow = (row: string[]) =>
  `  ${[...laid(row).join("   ")].map((character, i) => tint(hue(i), character)).join("")}`;

console.log(
  // labelled the way the groups above are, so it is clear the table covers the
  // run that just happened and not some fixed set of languages
  `\nbundle: ${PICKED ? covered.join(", ") : `${covered.length} languages`} (${size(
    measured.reduce((sum, c) => sum + c.bytes, 0),
  )})\n\n` +
    [
      line(rows[0]!, () => "gray"),
      tint("gray", `  ${"-".repeat(widths.reduce((sum, w) => sum + w + 3, -3))}`),
      ...sorted.map((w, i) =>
        w == baseline
          ? rainbow(rows[i + 1]!)
          : line(rows[i + 1]!, (column) =>
              column == 0
                ? ["cyan", "bold"]
                : column == 1
                  ? versus(w.min, baseline?.min)
                  : column == 2
                    ? versus(w.gzip, baseline?.gzip)
                    : column == 3
                      ? "gray"
                      : "magenta",
            ),
      ),
    ].join("\n") +
    "\n",
);
