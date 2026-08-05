/**
 * Render every bundled theme as one dense stack of cards, for the top of the
 * README.
 *
 * The sister figure to `scripts/theme-palette.ts`, which gives each theme a
 * card of its own further down the page. Here the cards are shingled into
 * columns like a dealt deck, so all of them fit in a banner: every card shows
 * only its header band — the theme name and its whole palette as one strip of
 * swatches — and the card at the front of each column is revealed in full, with
 * a code sample under the band to show the colors doing their job.
 *
 * A card behind another draws no sample: it would be covered by the next card,
 * and leaving it out is most of the file size.
 *
 * Usage: `pnpm theme` (`--out <path>`, `--columns <n>`, `--front <names>`)
 */

import { parseArgs } from "node:util";

import type { ShjTheme } from "../src/types.ts";
import {
  attr,
  drawCode,
  drawSwatches,
  type Entry,
  escape,
  FONT,
  LINE,
  MUTED,
  sampleColumns,
  sampleLines,
  swatchSlots,
  groups,
  swatchWidth,
  themes,
  writeSvg,
} from "./_svg.ts";

/**
 * The sample the front card of each column shows.
 *
 * Shorter than the one in the palette figure — a banner has no room for seven
 * lines, and the swatch strip on every card is what carries full coverage here.
 */
const SAMPLE = `// tiny, synchronous, zero-dependency
export const render = (code: string) =>
  codeToHtml(code, { lang: "ts", n: 0 });`;

const LANG = "ts";

// Card geometry. `HEAD` is the band a covered card keeps: the whole stack is
// built out of it, so it has to hold the name and the swatches on its own.
const PAD = 14;
const HEAD = 30;
const CODE_SIZE = 12;
const SWATCH = 8;
const SWATCH_GAP = 2;
const NAME_SIZE = 12.5;
const NAME_CHAR = NAME_SIZE * 0.6;
const GAP = 18;

/**
 * How far each card slides right of the one it covers.
 *
 * Without it the bands line up flush and the stack reads as a table of rows;
 * the offset is what makes the left edges legible as a deck of cards.
 */
const DRIFT = 7;

const first = themes[0]?.theme as ShjTheme;
const codeLines = sampleLines(SAMPLE, LANG, first).length;
const slots = swatchSlots(first).length;
const nameChars = Math.max(...themes.map((t) => t.theme.name.length));

const stripWidth = swatchWidth(slots, SWATCH, SWATCH_GAP);
const cardWidth = Math.max(
  nameChars * NAME_CHAR + 16 + stripWidth,
  sampleColumns(SAMPLE, LANG, first) * (CODE_SIZE * 0.6),
);
const cardOuter = Math.ceil(cardWidth) + 2 * PAD;
const cardHeight = HEAD + codeLines * LINE + PAD;

/**
 * One card. `full` draws the sample too — true only for the card at the front
 * of a column, the one nothing is stacked on top of.
 */
const drawCard = ({ theme }: Entry, x: number, y: number, full: boolean): string => {
  const name = escape(theme.name);
  const sample = full
    ? `\n    <g font-size="${CODE_SIZE}">
      ${drawCode(sampleLines(SAMPLE, LANG, theme), PAD, HEAD - 2, CODE_SIZE)}
    </g>`
    : "";
  return `
  <g transform="translate(${x} ${y})">
    <rect width="${cardOuter}" height="${cardHeight}" rx="8" fill="${attr(theme.bg)}"/>
    <rect width="${cardOuter}" height="${cardHeight}" rx="8" fill="none"
      stroke="${attr(theme.fg)}" stroke-opacity=".22"/>
    <text x="${PAD}" y="19.5" font-size="${NAME_SIZE}" font-weight="600" fill="${attr(theme.fg)}"
      textLength="${(theme.name.length * NAME_CHAR).toFixed(1)}"
      lengthAdjust="spacingAndGlyphs">${name}</text>
    <g>
      ${drawSwatches(swatchSlots(theme), theme, cardOuter - PAD - stripWidth, (HEAD - SWATCH) / 2, SWATCH, SWATCH_GAP)}
    </g>${sample}
  </g>`;
};

/**
 * The theme at the front of each column, in order — the ones drawn on top of
 * their stack and shown in full, with a code sample.
 *
 * A card behind another is only its name and its swatches, so these three are
 * the only themes the figure shows actually highlighting something, which is
 * why they are picked rather than left to the alphabet: a near-black, a white
 * and a mid blue-gray. Their order is part of the pick — the front row is read
 * across, so the light one goes in the middle.
 */
const FRONT = ["geist-dark", "vscode-light-modern", "nord"];

/**
 * Deal the themes into `cols` columns: name order, top to bottom and column by
 * column, with two rules on top of it.
 *
 * A light/dark pair is dealt as a unit, so a column boundary never falls
 * between `geist-light` and `geist-dark`, and a featured theme brings its
 * partner along to the front of its column — where the pair is the last thing
 * read, one card of each scheme.
 */
const layout = (cols: number, featured: (Entry | undefined)[]): Entry[][] => {
  // The group each featured theme belongs to travels with it; everything else
  // waits in name order.
  const front = featured.map((entry) => entry && groups.find((g) => g.includes(entry)));
  const queue = groups.filter((g) => !front.includes(g));

  const columns: Entry[][] = [];
  let left = themes.length;
  for (let c = 0; c < cols; c++) {
    const height = Math.ceil(left / (cols - c));
    const top = featured[c];
    const group = front[c];
    const room = height - (group?.length ?? 0);
    const column: Entry[] = [];
    // Never split a group across columns: a group that does not fit in what is
    // left of this column starts the next one instead.
    while (column.length + (queue[0]?.length ?? Infinity) <= room) {
      column.push(...(queue.shift() ?? []));
    }
    // The featured theme goes last, so it ends up the front card of the stack.
    if (group && top) column.push(...group.filter((e) => e !== top), top);
    columns.push(column);
    left -= column.length;
  }
  // A group too big for any column would otherwise be dropped.
  for (const group of queue) columns.at(-1)?.push(...group);

  return columns;
};

const render = (cols: number, featured: (Entry | undefined)[]): string => {
  const columns = layout(cols, featured);
  const tallest = Math.max(...columns.map((c) => c.length));
  const columnWidth = cardOuter + (tallest - 1) * DRIFT;
  const width = cols * columnWidth + (cols - 1) * GAP + 2 * GAP;
  const stack = (tallest - 1) * HEAD + cardHeight;
  const height = GAP + stack + 26;

  // Within a column, later cards are drawn last so they overlap the ones above.
  const cards = columns.flatMap((column, c) =>
    column.map((entry, i) =>
      drawCard(
        entry,
        GAP + c * (columnWidth + GAP) + i * DRIFT,
        GAP + i * HEAD,
        // The front card of the column, and of a short column the last one too.
        i === column.length - 1,
      ),
    ),
  );

  const caption =
    `${themes.length} bundled themes, each with its full palette:` +
    ` fg, line numbers and all 16 token types. A dashed swatch is a token that inherits fg.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"
  viewBox="0 0 ${width} ${height}" font-family="${attr(FONT)}">
  <title>rangi — ${themes.length} bundled themes</title>${cards.join("")}
  <text x="${GAP}" y="${GAP + stack + 16}" font-size="11" fill="${MUTED}">${escape(caption)}</text>
</svg>
`;
};

const { values } = parseArgs({
  options: {
    out: { type: "string" },
    columns: { type: "string" },
    front: { type: "string" },
  },
});

const cols = Math.max(1, Math.min(themes.length, Number(values.columns ?? 3)));
const front = (values.front ? values.front.split(",").map((n) => n.trim()) : FRONT).slice(0, cols);

// One slot per column, so a name that is not a theme leaves its own column to
// the alphabet with a warning instead of shifting the ones after it.
const featured = front.map((name) => {
  const entry = themes.find((t) => t.theme.name === name);
  if (!entry) console.warn(`--front: no theme named ${name}`);
  return entry;
});

const names = featured
  .filter((t) => t !== undefined)
  .map((t) => t.theme.name)
  .join(", ");

await writeSvg(
  values.out ?? "docs/themes-hero.svg",
  render(cols, featured),
  `${cols} columns, fronted by ${names}`,
);
