/**
 * @module themes
 * (Bundled themes, as plain data)
 */

import atomDark from "./atom-dark.ts";
import dark from "./dark.ts";
import defaultTheme from "./default.ts";
import githubDark from "./github-dark.ts";
import githubDim from "./github-dim.ts";
import githubLight from "./github-light.ts";
import visualStudioDark from "./visual-studio-dark.ts";

export { atomDark, dark, defaultTheme, githubDark, githubDim, githubLight, visualStudioDark };

/**
 * Name of a bundled theme.
 *
 * Every one of them is usable both in the browser and in the terminal.
 */
export type ShjThemeName =
  | "atom-dark"
  | "dark"
  | "default"
  | "github-dark"
  | "github-dim"
  | "github-light"
  | "visual-studio-dark";
