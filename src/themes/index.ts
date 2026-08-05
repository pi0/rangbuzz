/**
 * @module themes
 * (Bundled themes, as plain data)
 */

import type { ShjThemePair } from "../types.ts";

import atomDark from "./atom-dark.ts";
import catppuccinLatte from "./catppuccin-latte.ts";
import catppuccinMocha from "./catppuccin-mocha.ts";
import cssVariables from "./css-variables.ts";
import dark from "./dark.ts";
import defaultTheme from "./default.ts";
import dracula from "./dracula.ts";
import everforestDark from "./everforest-dark.ts";
import everforestLight from "./everforest-light.ts";
import geistDark from "./geist-dark.ts";
import geistLight from "./geist-light.ts";
import githubDark from "./github-dark.ts";
import githubDim from "./github-dim.ts";
import githubLight from "./github-light.ts";
import gruvboxDark from "./gruvbox-dark.ts";
import gruvboxLight from "./gruvbox-light.ts";
import monokai from "./monokai.ts";
import nightOwl from "./night-owl.ts";
import nord from "./nord.ts";
import oneLight from "./one-light.ts";
import solarizedDark from "./solarized-dark.ts";
import solarizedLight from "./solarized-light.ts";
import tokyoNight from "./tokyo-night.ts";
import vesper from "./vesper.ts";
import visualStudioDark from "./visual-studio-dark.ts";
import vscodeDarkModern from "./vscode-dark-modern.ts";
import vscodeLightModern from "./vscode-light-modern.ts";

export {
  atomDark,
  catppuccinLatte,
  catppuccinMocha,
  cssVariables,
  dark,
  defaultTheme,
  dracula,
  everforestDark,
  everforestLight,
  geistDark,
  geistLight,
  githubDark,
  githubDim,
  githubLight,
  gruvboxDark,
  gruvboxLight,
  monokai,
  nightOwl,
  nord,
  oneLight,
  solarizedDark,
  solarizedLight,
  tokyoNight,
  vesper,
  visualStudioDark,
  vscodeDarkModern,
  vscodeLightModern,
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

/** The two Catppuccin themes as one light/dark pair, {@link geist}-style */
export const catppuccin: ShjThemePair = {
  light: catppuccinLatte,
  dark: catppuccinMocha,
};

/** The two Everforest themes as one light/dark pair, {@link geist}-style */
export const everforest: ShjThemePair = {
  light: everforestLight,
  dark: everforestDark,
};

/** The two GitHub themes as one light/dark pair, {@link geist}-style */
export const github: ShjThemePair = { light: githubLight, dark: githubDark };

/** The two Gruvbox themes as one light/dark pair, {@link geist}-style */
export const gruvbox: ShjThemePair = {
  light: gruvboxLight,
  dark: gruvboxDark,
};

/** The two Solarized themes as one light/dark pair, {@link geist}-style */
export const solarized: ShjThemePair = {
  light: solarizedLight,
  dark: solarizedDark,
};

/** The two VS Code Modern themes as one light/dark pair, {@link geist}-style */
export const vscodeModern: ShjThemePair = {
  light: vscodeLightModern,
  dark: vscodeDarkModern,
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
  | "catppuccin-latte"
  | "catppuccin-mocha"
  | "css-variables"
  | "dark"
  | "default"
  | "dracula"
  | "everforest-dark"
  | "everforest-light"
  | "geist-dark"
  | "geist-light"
  | "github-dark"
  | "github-dim"
  | "github-light"
  | "gruvbox-dark"
  | "gruvbox-light"
  | "monokai"
  | "night-owl"
  | "nord"
  | "one-light"
  | "solarized-dark"
  | "solarized-light"
  | "tokyo-night"
  | "vesper"
  | "visual-studio-dark"
  | "vscode-dark-modern"
  | "vscode-light-modern";
