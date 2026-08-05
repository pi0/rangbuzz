/**
 * What the two theme figures share: the theme list, the type grid, and the two
 * things a card is made of — a highlighted code sample and a strip of swatches.
 *
 * Neither figure holds a palette of its own. The samples are highlighted by the
 * library itself, the same {@link tokenize} call `codeToHtml` makes, drawn with
 * `<tspan>` instead of `<span>` — so an SVG cannot drift from what the library
 * would actually emit, and a theme is picked up off the `src/themes/index.ts`
 * exports without either script naming it.
 *
 * - `scripts/theme-palette.ts` — the full grid, one card per theme
 * - `scripts/theme-hero.ts` — the stacked deck, for the top of the README
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { defaultThemes } from "../src/defaults.ts";
import { tokenize } from "../src/index.ts";
import * as bundled from "../src/themes/index.ts";
import { TOKENS } from "../src/tokens.ts";
import type { ShjTheme, ShjThemePair } from "../src/types.ts";

/**
 * The theme neither figure can draw, and why.
 *
 * `css-variables` is all `var(--shj-…)` references, which a standalone SVG has
 * nothing to resolve against.
 */
export const SKIP = new Set(["css-variables"]);

// Type geometry. `CHAR` is nominal: every `<tspan>` is drawn with `textLength`,
// so the grid holds whatever monospace font the viewer resolves.
export const FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'DejaVu Sans Mono', monospace";
export const SIZE = 12.5;
export const CHAR = SIZE * 0.6;
export const LINE = 19;

/** Color of a caption: mid gray, readable against either scheme. */
export const MUTED = "#8b8b8b";

export const escape = (s: string): string =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export const attr = (s: string): string => escape(s).replaceAll('"', "&quot;");

/** A theme, plus the identifier `rangi/themes` exports it under. */
export interface Entry {
  theme: ShjTheme;
  export: string;
}

const isTheme = (v: unknown): v is ShjTheme =>
  typeof v === "object" && v !== null && "bg" in v && "fg" in v && "tokens" in v;

/** Every drawable bundled theme, by name. */
export const themes: Entry[] = Object.entries(bundled)
  // Drops the `{ light, dark }` pairs, which are the same objects again.
  .filter((e): e is [string, ShjTheme] => isTheme(e[1]))
  .filter(([, theme]) => !SKIP.has(theme.name))
  .map(([name, theme]) => ({ theme, export: name }))
  .sort((a, b) => a.theme.name.localeCompare(b.theme.name));

const isPair = (v: unknown): v is ShjThemePair =>
  typeof v === "object" && v !== null && "light" in v && "dark" in v;

/** The names of the two halves of every bundled light/dark pair. */
const paired: string[][] = [defaultThemes, ...Object.values(bundled).filter(isPair)].map((p) => [
  p.light.name,
  p.dark.name,
]);

/**
 * The themes in name order, with the two halves of a light/dark pair kept
 * together as one unit — `geist-light` with `geist-dark`, `default` with
 * `dark` — so a layout can move a pair around without separating it.
 *
 * The pairs are the ones `rangi/themes` exports as pairs, rather than anything
 * guessed from the names.
 */
export const groups: Entry[][] = (() => {
  const seen = new Set<Entry>();
  const out: Entry[][] = [];
  for (const entry of themes) {
    if (seen.has(entry)) continue;
    const names = paired.find((p) => p.includes(entry.theme.name)) ?? [entry.theme.name];
    const group = themes.filter((t) => names.includes(t.theme.name));
    for (const t of group) seen.add(t);
    out.push(group);
  }
  return out;
})();

interface Part {
  text: string;
  color: string;
}

/** A sample tokenized and colored by one theme, split into lines. */
export const sampleLines = (code: string, lang: string, theme: ShjTheme): Part[][] => {
  const lines: Part[][] = [[]];
  for (const token of tokenize(code, { lang })) {
    const color = (token.type && theme.tokens[token.type]) || theme.fg;
    for (const [i, text] of token.text.split("\n").entries()) {
      if (i > 0) lines.push([]);
      if (text) lines.at(-1)?.push({ text, color });
    }
  }
  return lines;
};

/** The widest line of a sample, in characters — what a card has to be wide enough for. */
export const sampleColumns = (code: string, lang: string, theme: ShjTheme): number =>
  Math.max(...sampleLines(code, lang, theme).map((l) => l.reduce((a, t) => a + t.text.length, 0)));

/**
 * Draw a sample: one `<tspan>` per token, each pinned to its character column
 * and forced to its width, so the grid stays aligned under whatever monospace
 * font the viewer resolves rather than under the one this file assumed.
 */
export const drawCode = (lines: Part[][], x: number, top: number, size = SIZE): string => {
  const char = size * 0.6;
  const out: string[] = [];
  for (const [row, line] of lines.entries()) {
    if (line.length === 0) continue;
    const spans: string[] = [];
    let col = 0;
    for (const { text, color } of line) {
      const lead = text.length - text.trimStart().length;
      const body = text.trim();
      if (body) {
        spans.push(
          `<tspan x="${(x + (col + lead) * char).toFixed(1)}" fill="${attr(color)}"` +
            ` textLength="${(body.length * char).toFixed(1)}"` +
            ` lengthAdjust="spacingAndGlyphs">${escape(body)}</tspan>`,
        );
      }
      col += text.length;
    }
    out.push(`<text y="${(top + row * LINE + size).toFixed(1)}">${spans.join("")}</text>`);
  }
  return out.join("\n      ");
};

/** `fg`, `numbers` and every token type, in {@link TOKENS} order. */
export const swatchSlots = (theme: ShjTheme): [string, string | undefined][] => [
  ["fg", theme.fg],
  ["numbers", theme.numbers ?? theme.tokens.cmnt],
  ...TOKENS.map((t): [string, string | undefined] => [t, theme.tokens[t]]),
];

/** Width a swatch strip of `n` slots occupies. */
export const swatchWidth = (n: number, size: number, gap: number): number => n * (size + gap) - gap;

/**
 * Draw a swatch strip. A slot the theme leaves undefined comes out as a dashed
 * outline rather than a color: that token inherits `fg`.
 */
export const drawSwatches = (
  slots: [string, string | undefined][],
  theme: ShjTheme,
  x: number,
  y: number,
  size: number,
  gap: number,
): string =>
  slots
    .map(([name, color], i) => {
      const rx = Math.min(3, size / 3);
      const rect =
        `<rect x="${(x + i * (size + gap)).toFixed(1)}" y="${y}" width="${size}"` +
        ` height="${size}" rx="${rx.toFixed(1)}"` +
        (color
          ? ` fill="${attr(color)}"/>`
          : ` fill="none" stroke="${attr(theme.fg)}" stroke-opacity=".35" stroke-dasharray="2 2"/>`);
      return `<g><title>${escape(name)} — ${escape(color ?? "inherits fg")}</title>${rect}</g>`;
    })
    .join("\n      ");

/** Write a figure, and report what it cost. */
export const writeSvg = async (path: string, svg: string, note: string): Promise<void> => {
  const out = resolve(path);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, svg);
  console.log(`${themes.length} themes → ${out} (${(svg.length / 1024).toFixed(1)} kB, ${note})`);
  for (const name of SKIP) console.log(`skipped ${name}: its colors are CSS custom properties`);
};
