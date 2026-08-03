/**
 * @module themes
 * (Bundled themes, as plain data)
 */

import atomDark from "./atom-dark.ts";
import cssVariables from "./css-variables.ts";
import dark from "./dark.ts";
import defaultTheme from "./default.ts";
import githubDark from "./github-dark.ts";
import githubDim from "./github-dim.ts";
import githubLight from "./github-light.ts";
import visualStudioDark from "./visual-studio-dark.ts";

export {
  atomDark,
  cssVariables,
  dark,
  defaultTheme,
  githubDark,
  githubDim,
  githubLight,
  visualStudioDark,
};

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
  | "github-dark"
  | "github-dim"
  | "github-light"
  | "visual-studio-dark";
