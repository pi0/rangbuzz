/**
 * @module themes
 * (Bundled themes, as plain data)
 */

import type { ShjTheme } from "../types.ts";

import atomDark from "./atom-dark.ts";
import dark from "./dark.ts";
import defaultTheme from "./default.ts";
import githubDark from "./github-dark.ts";
import githubDim from "./github-dim.ts";
import githubLight from "./github-light.ts";
import visualStudioDark from "./visual-studio-dark.ts";

export { atomDark, dark, defaultTheme, githubDark, githubDim, githubLight, visualStudioDark };

/**
 * All bundled themes, keyed by name
 */
export const themes = {
  "atom-dark": atomDark,
  dark: dark,
  default: defaultTheme,
  "github-dark": githubDark,
  "github-dim": githubDim,
  "github-light": githubLight,
  "visual-studio-dark": visualStudioDark,
} satisfies Record<string, ShjTheme>;

/**
 * Name of a bundled theme, derived from {@link themes}.
 *
 * Every one of them is usable both in the browser and in the terminal.
 */
export type ShjThemeName = keyof typeof themes;
