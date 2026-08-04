/**
 * Print what {@link build}+{@link weigh}+{@link cold} found: a table of every
 * contender's bundle size, grammar count, build time and cold start, anchored
 * on our own default row and painted so that row is findable at a glance. See
 * `compare.bench.ts` for how the rows are assembled.
 */

import { styleText } from "node:util";

import type { ShjLanguage } from "../../src/types.ts";
import { type Corpus, size } from "../_corpus.ts";
import type { Weighed } from "./bundle.ts";
import { SELECTION } from "./run.ts";

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

/** Colors, applied last: an escape sequence would count towards a column width */
type Paint = Parameters<typeof styleText>[0];

const tint = (paint: Paint, text: string) =>
  // dropped when the output is not a terminal that asked for color, which is
  // what `mitata` does with its own
  styleText(paint, text, { validateStream: true, stream: process.stdout });

/**
 * Green where we are the smaller bundle, red where we are not
 *
 * Grey for our own other row: a ratio between our two output modes is not a
 * contest, and painting it red for being the smaller of the two would read as
 * a loss.
 */
const versus = (bytes: number, ours?: number, mine?: true): Paint =>
  mine || !ours || bytes == ours ? "gray" : bytes > ours ? "green" : "red";

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
 * Print the bundle table
 *
 * @param sorted Every contender that shipped a bundle, gzip size ascending
 * @param baseline `sorted`'s entry for `rangi`, the row every ratio is a
 * multiple of
 * @param picked The corpora `--lang` named, if any
 * @param covered The languages `sorted` was measured over
 * @param measured The corpora those languages came from, for the total size
 * in the header
 */
export const printTable = (
  sorted: Weighed[],
  baseline: Weighed | undefined,
  picked: Corpus[] | undefined,
  covered: ShjLanguage[],
  measured: Corpus[],
): void => {
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

  /**
   * The baseline row, painted as a rainbow
   *
   * It is the one every other row is a multiple of, so it should be findable
   * without reading the names — and none of the rules above can mark it,
   * because every ratio in the baseline row is `1x`, which {@link versus}
   * greys out, and a grey row is the opposite of a marked one.
   *
   * A character at a time rather than a column at a time, so the hue carries
   * across the gaps between the columns and the row reads as one band instead
   * of six blocks.
   *
   * @param row The row's cells
   * @returns It, laid out and painted
   */
  const rainbow = (row: string[]) =>
    `  ${[...laid(row).join("   ")].map((character, i) => tint(hue(i), character)).join("")}`;

  /**
   * How one cell of a row that is not the baseline is painted
   *
   * Our other output mode gets {@link SELECTION} on its name, the same colour
   * mitata marked both of our rows with above, so it is still ours at a glance
   * without being mistaken for the row the ratios are against.
   *
   * @param w The row's measurements
   * @param column Which cell
   * @returns Its colour
   */
  const paint = (w: Weighed, column: number): Paint =>
    column == 0
      ? [w.mine ? SELECTION : "cyan", "bold"]
      : column == 1
        ? versus(w.min, baseline?.min, w.mine)
        : column == 2
          ? versus(w.gzip, baseline?.gzip, w.mine)
          : column == 3
            ? "gray"
            : "magenta";

  console.log(
    // labelled the way the groups above are, so it is clear the table covers
    // the run that just happened and not some fixed set of languages
    `\nbundle: ${picked ? covered.join(", ") : `${covered.length} languages`} (${size(
      measured.reduce((sum, c) => sum + c.bytes, 0),
    )})\n\n` +
      [
        line(rows[0]!, () => "gray"),
        tint("gray", `  ${"-".repeat(widths.reduce((sum, w) => sum + w + 3, -3))}`),
        ...sorted.map((w, i) =>
          w == baseline ? rainbow(rows[i + 1]!) : line(rows[i + 1]!, (column) => paint(w, column)),
        ),
      ].join("\n") +
      "\n",
  );
};
