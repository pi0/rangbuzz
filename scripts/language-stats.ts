/**
 * Rank the bundled grammars against real-world GitHub language usage, and list
 * the popular languages that are still missing.
 *
 * Two sources, both public and unauthenticated:
 *
 * - GitHub Innovation Graph — official, CC0, quarterly, `num_pushers` per
 *   language per economy. The primary signal.
 * - GitHut 2.0 — GH Archive via BigQuery, push/PR/star counts per language.
 *   Unmaintained since 2024 Q1, kept only as a historical cross check: it
 *   weighs activity where the Innovation Graph weighs repository presence.
 *   Treat its columns as a snapshot, never as current usage.
 *
 * Every source prints how many quarters behind it is, so one going quiet is
 * visible in the output instead of being silently believed.
 *
 * Both are Linguist derived, so they count *repositories*: a format only scores
 * when it is a repo's dominant language. `md`, `json`, `yaml` and friends rank
 * near the bottom for that reason alone, not because they are rare — for a
 * highlighter, whose input is mostly documentation, they are among the most
 * used grammars. Trust the ranking for programming languages only.
 *
 * Usage: `pnpm language-stats`
 */

import { languages } from "../src/languages.ts";
import type { ShjLanguage } from "../src/languages.ts";

const IG_URL = "https://raw.githubusercontent.com/github/innovationgraph/main/data/languages.csv";
const GITHUT_URL = "https://raw.githubusercontent.com/madnight/githut/master/src/data";

/**
 * Bundled language -> the Linguist name(s) it corresponds to, `[]` when GitHub
 * has no equivalent (`log`, `todo`, sub-grammars like `regex`, …).
 *
 * Typed against {@link ShjLanguage}, so adding a grammar without deciding how
 * it maps fails `pnpm typecheck`.
 */
const LINGUIST: Record<ShjLanguage, readonly string[]> = {
  asm: ["Assembly"],
  astro: ["Astro"],
  bash: ["Shell"],
  c: ["C"],
  cpp: ["C++"],
  cs: ["C#"],
  css: ["CSS"],
  csv: [],
  dart: ["Dart"],
  diff: ["Diff"],
  docker: ["Dockerfile"],
  go: ["Go"],
  graphql: ["GraphQL"],
  html: ["HTML"],
  http: [],
  ini: ["INI"],
  java: ["Java"],
  js: ["JavaScript"],
  jsdoc: [],
  json: ["JSON"],
  kt: ["Kotlin"],
  less: ["Less"],
  log: [],
  lua: ["Lua"],
  make: ["Makefile"],
  md: ["Markdown"],
  php: ["PHP"],
  pl: ["Perl"],
  plain: [],
  ps1: ["PowerShell"],
  py: ["Python"],
  rb: ["Ruby"],
  regex: [],
  rs: ["Rust"],
  scss: ["SCSS"],
  sql: ["SQL", "PLpgSQL", "TSQL", "PLSQL"],
  svelte: ["Svelte"],
  swift: ["Swift"],
  toml: ["TOML"],
  ts: ["TypeScript"],
  uri: [],
  vue: ["Vue"],
  xml: ["XML"],
  yaml: ["YAML"],
};

/** How many missing languages to list. */
const MISSING_COUNT = 60;

interface Tally {
  /** Language -> summed count for the most recent period. */
  counts: Map<string, number>;
  /** Language -> 1-based position within {@link counts}. */
  ranks: Map<string, number>;
  total: number;
  period: string;
}

const tally = (rows: Iterable<[string, number]>, period: string): Tally => {
  const counts = new Map<string, number>();
  let total = 0;
  for (const [name, count] of rows) {
    counts.set(name, (counts.get(name) ?? 0) + count);
    total += count;
  }
  const ranks = new Map(
    [...counts].sort((a, b) => b[1] - a[1]).map(([name], i) => [name, i + 1] as const),
  );
  return { counts, ranks, total, period };
};

const fetchText = async (url: string): Promise<string> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.text();
};

/** `num_pushers,language,language_type,iso2_code,year,quarter` */
const parseInnovationGraph = (csv: string): { tally: Tally; types: Map<string, string> } => {
  const lines = csv.trim().split("\n").slice(1);
  const parsed = lines.map((line) => {
    const cells = line.split(",");
    // Only `language` can contain a comma; the 1 leading and 4 trailing columns cannot.
    const language = cells.slice(1, cells.length - 4).join(",");
    const [type, , year, quarter] = cells.slice(cells.length - 4);
    return { count: Number(cells[0]), language, type: type ?? "", period: `${year}Q${quarter}` };
  });

  const latest = parsed.reduce((a, r) => (r.period > a ? r.period : a), "");
  const current = parsed.filter((r) => r.period === latest);
  return {
    tally: tally(
      current.map((r) => [r.language, r.count] as [string, number]),
      latest,
    ),
    types: new Map(current.map((r) => [r.language, r.type])),
  };
};

/** `[{ name, year, quarter, count }]`, every value a string. */
const parseGitHut = (json: string): Tally => {
  const rows = JSON.parse(json) as { name: string; year: string; quarter: string; count: string }[];
  const stamped = rows.map((r) => ({ ...r, period: `${r.year}Q${r.quarter}` }));
  const latest = stamped.reduce((a, r) => (r.period > a ? r.period : a), "");
  return tally(
    stamped.filter((r) => r.period === latest).map((r) => [r.name, Number(r.count)]),
    latest,
  );
};

const pad = (v: string | number | undefined, width: number) =>
  (v === undefined ? "-" : String(v)).padStart(width);

/**
 * Label a period ("2026Q1") with how far behind the current quarter it is.
 *
 * These datasets publish a quarter or so in arrears, so one quarter behind is
 * healthy; anything further means the source has gone quiet and its numbers
 * should not be read as current.
 */
const freshness = (period: string): string => {
  const now = new Date();
  const nowIndex = now.getUTCFullYear() * 4 + Math.floor(now.getUTCMonth() / 3);
  const [year, quarter] = period.split("Q").map(Number);
  const behind = nowIndex - ((year ?? 0) * 4 + (quarter ?? 1) - 1);
  if (behind <= 2) return period;
  return `${period} (${behind} quarters behind — STALE, treat as historical)`;
};

const [igRaw, push, pr, star] = await Promise.all([
  fetchText(IG_URL),
  fetchText(`${GITHUT_URL}/gh-push-event.json`),
  fetchText(`${GITHUT_URL}/gh-pull-request.json`),
  fetchText(`${GITHUT_URL}/gh-star-event.json`),
]);

const { tally: ig, types } = parseInnovationGraph(igRaw);
const githut = { push: parseGitHut(push), pr: parseGitHut(pr), star: parseGitHut(star) };

console.log(
  `Innovation Graph ${freshness(ig.period)}` +
    ` — ${ig.counts.size} languages, ${ig.total.toLocaleString()} pushers`,
);
console.log(`GitHut ${freshness(githut.push.period)} — push/pr/star columns only`);
console.log(
  `\nBoth count repositories, not snippets: prose and data formats (md, json, yaml, …)\nrank low by construction. Read the ranking for programming languages only.\n`,
);

console.log("== BUILT-INS ==");
console.log("lang            type         IG%   IG#  push#   pr#  star#");

const built = Object.keys(languages)
  // `LINGUIST` is keyed by `ShjLanguage`, so this drops exactly the fragment
  // grammars (`js_template_literals`, `todo`) and stays right as that set moves.
  .filter((name): name is ShjLanguage => name in LINGUIST)
  .map((name) => {
    const names = LINGUIST[name];
    if (names.length === 0) return { name, share: -1 };
    const share = (names.reduce((a, n) => a + (ig.counts.get(n) ?? 0), 0) / ig.total) * 100;
    const first = names[0] as string;
    return {
      name,
      share,
      rank: names
        .map((n) => ig.ranks.get(n))
        .filter((r) => r !== undefined)
        .sort((a, b) => a - b)[0],
      type: types.get(first),
      push: githut.push.ranks.get(first),
      pr: githut.pr.ranks.get(first),
      star: githut.star.ranks.get(first),
    };
  })
  .sort((a, b) => b.share - a.share);

for (const b of built) {
  if (b.share < 0) {
    console.log(`${b.name.padEnd(15)} (no GitHub equivalent)`);
    continue;
  }
  console.log(
    `${b.name.padEnd(15)} ${(b.type ?? "?").padEnd(11)} ${b.share.toFixed(2).padStart(5)}` +
      ` ${pad(b.rank, 5)} ${pad(b.push, 6)} ${pad(b.pr, 5)} ${pad(b.star, 6)}`,
  );
}

console.log(`\n== TOP ${MISSING_COUNT} ON GITHUB, NOT BUNDLED ==`);
console.log("  IG#  lang                 type         IG%  push#   pr#  star#");

const covered = new Set(Object.values(LINGUIST).flat());
const missing = [...ig.counts].sort((a, b) => b[1] - a[1]).filter(([name]) => !covered.has(name));

for (const [name, count] of missing.slice(0, MISSING_COUNT)) {
  console.log(
    `${pad(ig.ranks.get(name), 5)}  ${name.padEnd(20)} ${(types.get(name) ?? "?").padEnd(11)}` +
      ` ${((count / ig.total) * 100).toFixed(2).padStart(5)} ${pad(githut.push.ranks.get(name), 6)}` +
      ` ${pad(githut.pr.ranks.get(name), 5)} ${pad(githut.star.ranks.get(name), 6)}`,
  );
}
