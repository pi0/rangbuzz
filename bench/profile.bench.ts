/**
 * Where the time goes — `pnpm bench:profile`.
 *
 * `pnpm bench` says whether a change made the library faster. This says what to
 * change: the same `codeToHtml` workloads, run under V8's sampling profiler,
 * reported as the functions, the source lines and the call paths the samples
 * actually landed on.
 *
 * Three tables per scenario, narrowing as they go:
 *
 * 1. **functions** — self time, so a caller is not credited with the work of
 *    what it called. `eachToken` is expected to own most of it; what is worth
 *    reading is everything else, because that is the part of the cost that is
 *    not the rule engine.
 * 2. **lines** — the same samples at line granularity, from the profiler's own
 *    per position tick counts, printed with the line of source next to them.
 *    This is the table to read first: it points at a statement, not a function.
 * 3. **paths** — self time by call path, so a line that is hot from two
 *    directions is split rather than summed. Recursion is collapsed, since
 *    `eachToken` re-enters itself once per sub-language and the raw stacks
 *    would otherwise differ only in how deep the nesting went.
 *
 * A regex is not a frame of its own: V8 attributes time spent inside
 * `RegExp.prototype.exec` to the JavaScript function that called it, so every
 * rule of every grammar is folded into `eachToken`'s self time. The profiler
 * cannot say which rule was slow — only that the answer is in there. `pnpm
 * bench --lang js,ts` is what separates grammars from one another.
 *
 * The profile is also written to `bench/.profiles/<scenario>.cpuprofile`, which
 * is the format Chrome DevTools (Performance → load profile) and
 * [speedscope](https://speedscope.app) read. The tables below are a summary;
 * that file is the whole thing, flame graph included.
 *
 * Scenarios, `--scenario grammars|corpus|scale|all`, mirroring `pnpm bench`:
 *
 * - **grammars** (the default) — every grammar in a pass, each corpus repeated
 *   out to the same 16 kB. Steady state: whatever is hot here is hot for a
 *   large input in any language.
 * - **corpus** — every snippet of every language, a few hundred bytes each,
 *   which is where per call overhead is visible. What is hot here and cold in
 *   `grammars` is setup: the block markup, the theme lookups, the copy of the
 *   rule array `eachToken` makes per call.
 * - **scale** — one 256 kB snippet, one call. The shape of the cost when the
 *   input is a single long document rather than a page of them.
 *
 * `--lang js,ts` narrows the grammars profiled (and picks the language `scale`
 * grows), `--ms 3000` is how long each scenario is sampled for, `--top 12` how
 * many rows a table gets.
 *
 * The workload is warmed before the profiler starts, so what is sampled is
 * optimized code rather than the interpreter and the optimizing compiler. That
 * is the right default for finding a hot path, and the wrong one for asking
 * about cold start — nothing here measures the first call.
 *
 * Sampling is statistical: a row a few tenths of a percent from another is not
 * necessarily above it, and a longer `--ms` is the fix. This measures `src/`
 * for the same reason `highlight.bench.ts` does.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { Profiler } from "node:inspector";
import { Session } from "node:inspector/promises";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { styleText } from "node:util";

import { codeToHtml } from "../src/index.ts";
import type { ShjLanguage } from "../src/types.ts";
import {
  BLOCKS,
  corpusOf,
  CORPUS,
  flag,
  grow,
  longest,
  PICKED,
  scale,
  size,
  TOTAL_BYTES,
} from "./_corpus.ts";

/** The total length every corpus is repeated out to in the `grammars` scenario */
const BLOCK = 16 * 1024,
  /** The length the one snippet of the `scale` scenario is grown to */
  GROWN = 256 * 1024,
  /** How long each scenario is sampled for, after it has been warmed */
  SAMPLE_MS = Number(flag("ms") ?? 3000),
  /** How long a scenario runs before the profiler is started, to let V8 settle */
  WARMUP_MS = 500,
  /** The distance between two samples: V8 defaults to 1 ms, which is coarse for a 3 s run */
  INTERVAL_US = 100,
  /** How many rows a table gets */
  TOP = Number(flag("top") ?? 12);

/** `src/`, as the profiler spells the file a frame is in */
const SRC = new URL("../src/", import.meta.url).href;

/** Where the raw profiles are written, for a flame graph */
const PROFILES = new URL("./.profiles/", import.meta.url);

/**
 * Everything the workload returned, added up.
 *
 * `mitata` has `do_not_optimize` for this; there is no runner here, so the
 * lengths are accumulated into something the process could in principle read,
 * which is enough to keep the calls from being optimized away.
 */
let sink = 0;

/** One workload, sampled on its own */
interface Scenario {
  /** What it is called, on the command line and in the file it writes */
  name: string;
  /** What it covers, printed under the heading */
  label: string;
  /**
   * Run the workload once
   *
   * @returns How many `codeToHtml` calls that took
   */
  pass: () => number;
}

/** The language `scale` grows, and the first one `--lang` named if it named any */
const SCALED = (PICKED?.[0]?.lang ?? "js") as ShjLanguage;

const SCENARIOS: Record<string, () => Scenario> = {
  grammars: () => {
    const passes = (PICKED ?? CORPUS).map((c) => ({ lang: c.lang, blocks: scale(c, BLOCK) }));

    return {
      name: "grammars",
      label: `${passes.length} grammar${passes.length == 1 ? "" : "s"}, ${size(BLOCK)} each`,
      pass: () => {
        let calls = 0;
        for (const { lang, blocks } of passes)
          for (const code of blocks) {
            sink += codeToHtml(code, { lang }).length;
            calls++;
          }
        return calls;
      },
    };
  },

  corpus: () => ({
    name: "corpus",
    label: `every block of every language, ${size(TOTAL_BYTES)}`,
    pass: () => {
      for (const b of BLOCKS) sink += codeToHtml(b.code, b.opt).length;
      return BLOCKS.length;
    },
  }),

  scale: () => {
    const code = grow(longest(corpusOf(SCALED)), GROWN);

    return {
      name: "scale",
      label: `one ${SCALED} snippet, ${size(GROWN)}`,
      pass: () => {
        sink += codeToHtml(code, { lang: SCALED }).length;
        return 1;
      },
    };
  },
};

/** The scenarios asked for, in the order they are declared above */
const asked = flag("scenario") ?? "grammars",
  names =
    asked == "all"
      ? Object.keys(SCENARIOS)
      : asked
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

for (const name of names)
  if (!(name in SCENARIOS))
    throw new Error(`no scenario "${name}" — one of ${Object.keys(SCENARIOS).join(", ")}, or all`);

/**
 * Run a workload for at least `ms`
 *
 * A pass is never cut short: the profile is of whole `codeToHtml` calls over a
 * whole corpus, so stopping mid pass would weight whichever languages come
 * first in the registry.
 *
 * @param scenario The workload
 * @param ms How long to keep going for
 * @returns How many calls it made
 */
const spin = (scenario: Scenario, ms: number): number => {
  const until = performance.now() + ms;
  let calls = 0;

  do calls += scenario.pass();
  while (performance.now() < until);

  return calls;
};

const session = new Session();
session.connect();
await session.post("Profiler.enable");
await session.post("Profiler.setSamplingInterval", { interval: INTERVAL_US });

/**
 * Sample a workload
 *
 * @param scenario The workload
 * @returns The profile, and how many calls went into it
 */
const record = async (
  scenario: Scenario,
): Promise<{ profile: Profiler.Profile; calls: number }> => {
  spin(scenario, WARMUP_MS);

  await session.post("Profiler.start");
  const calls = spin(scenario, SAMPLE_MS);
  const { profile } = await session.post("Profiler.stop");

  return { profile, calls };
};

/** A frame, as a table row names it */
interface Frame {
  /** What it is aggregated by: one function, wherever V8 split it across nodes */
  key: string;
  /** The name to print */
  label: string;
  /** Where it is, `src/highlight.ts:139`, empty for the profiler's own buckets */
  where: string;
  /** Whether it is ours, which is what the line and path tables keep */
  ours: boolean;
}

/**
 * Name a call frame
 *
 * Everything outside `src/` is rolled up rather than listed: a benchmark that
 * printed its own driver, Node's module loader and the profiler's `(program)`
 * bucket as separate rows would bury the four functions the run is about. The
 * buckets stay in the table because their total is worth seeing — a garbage
 * collector at 15% is a finding.
 *
 * @param frame The frame, as the profile carries it
 * @returns How to print and aggregate it
 */
const describe = (frame: Profiler.ProfileNode["callFrame"]): Frame => {
  const { functionName, url, lineNumber } = frame;

  // `(garbage collector)`, `(program)`, `(idle)`, `(root)`: no script, and the
  // name is already parenthesized
  if (!url) return { key: functionName, label: functionName, where: "", ours: false };

  if (url.startsWith(SRC)) {
    const where = `src/${url.slice(SRC.length)}:${lineNumber + 1}`;
    return {
      key: `${functionName}\0${where}`,
      // a callback handed to `eachToken`, or a top level statement, has no name
      label: functionName || "(anonymous)",
      where,
      ours: true,
    };
  }

  const bucket = url.startsWith("node:") ? "(node internals)" : "(benchmark)";
  return { key: bucket, label: bucket, where: "", ours: false };
};

/** A profile, reduced to what the tables read */
interface Sampled {
  /** Total sampled time, in milliseconds */
  total: number;
  /** Self time per function, in milliseconds */
  functions: Map<string, { frame: Frame; ms: number }>;
  /** Self time per source line of `src/`, in milliseconds */
  lines: Map<string, { where: string; ms: number }>;
  /** Self time per call path, in milliseconds */
  paths: Map<string, number>;
}

/**
 * Add up a profile
 *
 * Self time comes from the samples rather than from `hitCount`, so the
 * milliseconds are the profiler's own deltas and not a sample count multiplied
 * by the interval it was asked for.
 *
 * @param profile The profile
 * @returns What the tables print
 */
const reduce = (profile: Profiler.Profile): Sampled => {
  const { nodes, samples = [], timeDeltas = [] } = profile,
    byId = new Map(nodes.map((n) => [n.id, n])),
    parent = new Map<number, number>();

  for (const node of nodes) for (const child of node.children ?? []) parent.set(child, node.id);

  /** Self time per node, in microseconds */
  const self = new Map<number, number>();
  let total = 0;

  for (const [i, id] of samples.entries()) {
    const delta = timeDeltas[i] ?? 0;
    self.set(id, (self.get(id) ?? 0) + delta);
    total += delta;
  }

  /**
   * The call path a node is the top of.
   *
   * Cached: a node *is* its path — the same function reached two ways is two
   * nodes — so the walk up to the root is done once per node however many
   * samples landed on it.
   */
  const paths = new Map<number, string>(),
    pathOf = (id: number): string => {
      const cached = paths.get(id);
      if (cached !== undefined) return cached;

      const frames: string[] = [];
      for (let at: number | undefined = id; at !== undefined; at = parent.get(at)) {
        const frame = describe(byId.get(at)!.callFrame);
        // the leaf is kept whatever it is: a sample sitting in the garbage
        // collector under `eachToken` is about `eachToken`, and saying so is
        // the point of the row
        if (!frame.ours && frames.length) continue;
        // `eachToken` re-enters itself once per sub-language, and a path per
        // depth would be the same path several times
        if (frames.at(-1) != frame.label) frames.push(frame.label);
      }

      const path = frames.reverse().join(" › ");
      paths.set(id, path);
      return path;
    };

  const out: Sampled = {
    total: total / 1000,
    functions: new Map(),
    lines: new Map(),
    paths: new Map(),
  };

  for (const [id, us] of self) {
    const node = byId.get(id);
    if (!node || !us) continue;

    const ms = us / 1000,
      frame = describe(node.callFrame),
      fn = out.functions.get(frame.key);

    if (fn) fn.ms += ms;
    else out.functions.set(frame.key, { frame, ms });

    out.paths.set(pathOf(id), (out.paths.get(pathOf(id)) ?? 0) + ms);

    // the profiler counts its ticks per position within a function; this
    // node's self time is split over them, so a line keeps the units the
    // function table uses
    const ticks = frame.ours ? (node.positionTicks ?? []) : [];
    if (!ticks.length) continue;

    const counted = ticks.reduce((sum, t) => sum + t.ticks, 0);
    for (const tick of ticks) {
      const where = `${frame.where.slice(0, frame.where.lastIndexOf(":"))}:${tick.line}`,
        line = out.lines.get(where);

      if (line) line.ms += (ms * tick.ticks) / counted;
      else out.lines.set(where, { where, ms: (ms * tick.ticks) / counted });
    }
  }

  return out;
};

/** The source of `src/`, read once per file, for the line table */
const sources = new Map<string, string[]>(),
  sourceLine = (where: string): string => {
    const at = where.lastIndexOf(":"),
      file = where.slice(0, at),
      line = Number(where.slice(at + 1));

    if (!sources.has(file))
      sources.set(file, readFileSync(new URL(`../${file}`, import.meta.url), "utf8").split("\n"));

    return (sources.get(file)![line - 1] ?? "").trim();
  };

/** Colors, applied last: an escape sequence would count towards a column width */
type Paint = Parameters<typeof styleText>[0];

const tint = (paint: Paint, text: string) =>
  // dropped when the output is not a terminal that asked for color, the way
  // `mitata` drops its own
  styleText(paint, text, { validateStream: true, stream: process.stdout });

/**
 * Print a table
 *
 * The last column is left unpadded, so a long line of source runs off the end
 * rather than widening everything above it.
 *
 * @param heading What the table is
 * @param rows Its cells, already formatted
 * @param paint The color of a column
 */
const table = (heading: string, rows: string[][], paint: (column: number) => Paint) => {
  if (!rows.length) return;

  const widths = rows[0]!.map((_, i) => Math.max(...rows.map((row) => row[i]?.length ?? 0)));

  console.log(
    `\n  ${tint("bold", heading)}\n` +
      rows
        .map(
          (row) =>
            `  ${row
              .map((cell, i) =>
                tint(paint(i), i == row.length - 1 ? cell : cell.padEnd(widths[i]!)),
              )
              .join("  ")}`,
        )
        .join("\n"),
  );
};

/**
 * Milliseconds, at the precision worth reading
 *
 * @param ms The duration
 * @returns `"1.86 s"`, `"812 ms"`, `"9.4 ms"`
 */
const time = (ms: number): string =>
  ms >= 1000
    ? `${(ms / 1000).toFixed(2)} s`
    : ms >= 10
      ? `${ms.toFixed(0)} ms`
      : `${ms.toFixed(1)} ms`;

/** A share of the profile, as the tables print it */
const share = (ms: number, total: number): string => `${((100 * ms) / total).toFixed(1)}%`;

/**
 * Cut a string that would push a table off the terminal
 *
 * @param text The text
 * @param max How long it may be
 * @returns It, with an ellipsis where it was cut
 */
const clip = (text: string, max: number): string =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

console.log(
  `corpus: ${CORPUS.length} languages, ${BLOCKS.length} blocks, ${size(TOTAL_BYTES)} total`,
);

mkdirSync(PROFILES, { recursive: true });

for (const name of names) {
  const scenario = SCENARIOS[name]!(),
    { profile, calls } = await record(scenario),
    sampled = reduce(profile),
    { total } = sampled;

  const file = new URL(`${scenario.name}.cpuprofile`, PROFILES);
  writeFileSync(file, JSON.stringify(profile));

  console.log(
    `\n${tint(["cyan", "bold"], scenario.name)} ${tint("gray", `— ${scenario.label}`)}\n` +
      tint(
        "gray",
        `  ${time(total)} of samples, ${profile.samples?.length ?? 0} of them, over ${calls} calls`,
      ),
  );

  const ranked = [...sampled.functions.values()].sort((a, b) => b.ms - a.ms);

  table(
    "functions (self time)",
    ranked
      .slice(0, TOP)
      .map(({ frame, ms }) => [share(ms, total), time(ms), frame.label, tint("gray", frame.where)]),
    (column) => (column == 0 ? "yellow" : column == 1 ? "gray" : column == 2 ? "white" : "gray"),
  );

  table(
    "lines (self time)",
    [...sampled.lines.values()]
      .sort((a, b) => b.ms - a.ms)
      .slice(0, TOP)
      .map(({ where, ms }) => [share(ms, total), where, clip(sourceLine(where), 64)]),
    (column) => (column == 0 ? "yellow" : column == 1 ? "gray" : "white"),
  );

  table(
    "paths (self time, recursion collapsed)",
    [...sampled.paths.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP)
      .map(([path, ms]) => [share(ms, total), clip(path, 88)]),
    (column) => (column == 0 ? "yellow" : "white"),
  );

  console.log(tint("gray", `\n  flame graph: ${relative(process.cwd(), fileURLToPath(file))}`));
}

session.disconnect();

// The one thing a reader would otherwise take the tables to be saying, since a
// regex based highlighter is mostly regexes and none of them are named here.
console.log(
  tint(
    "gray",
    "\nnote: v8 charges time inside a regex to the function that ran it, so every rule" +
      "\n      of every grammar is part of eachToken's self time and none of them is a row",
  ),
);

if (!sink) throw new Error("nothing was highlighted");
