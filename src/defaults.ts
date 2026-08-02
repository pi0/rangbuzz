/**
 * @module defaults
 * (The themes bundled with the highlighter itself)
 */

import type { ShjThemePair } from "./types.ts";

import dark from "./themes/dark.ts";
import light from "./themes/default.ts";

/**
 * The theme used by default: the two bundled themes, following the color
 * scheme of the reader
 *
 * These two are the only themes the highlighter pulls in; import any other one
 * from `rangi/themes` and pass it as the `theme` option.
 */
export const defaultThemes: ShjThemePair = { light, dark };
