/**
 * @module themes
 * (Bundled themes, as plain data)
 */

import type { ShjThemePair } from "../types.ts";

import atomDark from "./atom-dark.ts";
import cssVariables from "./css-variables.ts";
import dark from "./dark.ts";
import defaultTheme from "./default.ts";
import geistDark from "./geist-dark.ts";
import geistLight from "./geist-light.ts";
import githubDark from "./github-dark.ts";
import githubDim from "./github-dim.ts";
import githubLight from "./github-light.ts";
import visualStudioDark from "./visual-studio-dark.ts";

export {
  atomDark,
  cssVariables,
  dark,
  defaultTheme,
  geistDark,
  geistLight,
  githubDark,
  githubDim,
  githubLight,
  visualStudioDark,
};

/**
 * The two Geist themes as one light/dark pair
 *
 * Passed as the `theme` option, its colors are inlined with `light-dark()` and
 * follow the reader's color scheme, the way `defaultThemes` does. A pair
 * has no name of its own; the terminal, which has no scheme to follow, reads it
 * as {@link geistDark}.
 */
export const geist: ShjThemePair = { light: geistLight, dark: geistDark };

/**
 * Name of a bundled theme.
 *
 * All but `css-variables` are usable both in the browser and in the terminal:
 * its colors are custom properties, which a terminal cannot resolve, so it
 * comes out uncolored there.
 */
export type ShjThemeName =
  | "atom-dark"
  | "css-variables"
  | "dark"
  | "default"
  | "geist-dark"
  | "geist-light"
  | "github-dark"
  | "github-dim"
  | "github-light"
  | "visual-studio-dark";
