/**
 * @module terminal
 * (Terminal adaptor)
 */

import type { ShjLanguage, ShjTerminalTheme, ShjToken } from "./types.ts";

import { tokenize } from "./index.ts";
import atomDark from "./themes/atom-dark.ts";
import defaultTheme from "./themes/default.ts";

const themes: Record<string, Partial<Record<ShjToken, string>>> = {
  default: defaultTheme,
  "atom-dark": atomDark,
};

let theme = defaultTheme;

/**
 * Highlight a string passed as argument and return a string that can directly be printed
 *
 * @function highlightText
 * @param {string} src The code
 * @param {ShjLanguage} lang The language of the code
 * @returns {string} The highlighted string
 */
export const highlightText = (src: string, lang: ShjLanguage) => {
  let res = "";

  tokenize(src, lang, (str, token) => (res += token ? `${theme[token] ?? ""}${str}\x1b[0m` : str));

  return res;
};

/**
 * Highlight and print a given string
 *
 * @function printHighlight
 * @param {string} src The code
 * @param {ShjLanguage} lang The language of the code
 */
export const printHighlight = (src: string, lang: ShjLanguage) =>
  console.log(highlightText(src, lang));

/**
 * Change the current used theme for highlighting
 *
 * @function setTheme
 * @param {ShjTerminalTheme} name The name of the theme
 */
export const setTheme = (name: ShjTerminalTheme) => (theme = themes[name] ?? defaultTheme);
