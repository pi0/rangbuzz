/**
 * @module terminal
 * (Terminal adaptor)
 */

import type { ShjLanguage, ShjTerminalTheme, ShjToken } from "./types.ts";

import { tokenize } from "./index.ts";

let theme: Promise<{ default: Partial<Record<ShjToken, string>> }> = import("./themes/default.ts");

/**
 * Highlight a string passed as argument and return a string that can directly be printed
 *
 * @async
 * @function highlightText
 * @param {string} src The code
 * @param {ShjLanguage} lang The language of the code
 * @returns {Promise<string>} The highlighted string
 */
export const highlightText = async (src: string, lang: ShjLanguage) => {
  let res = "",
    themeMap = (await theme).default;

  await tokenize(
    src,
    lang,
    (str, token) => (res += token ? `${themeMap[token] ?? ""}${str}\x1b[0m` : str),
  );

  return res;
};

/**
 * Highlight and print a given string
 *
 * @async
 * @function printHighlight
 * @param {string} src The code
 * @param {ShjLanguage} lang The language of the code
 */
export const printHighlight = async (src: string, lang: ShjLanguage) =>
  console.log(await highlightText(src, lang));

/**
 * Change the current used theme for highlighting
 *
 * @function setTheme
 * @param {ShjTerminalTheme} name The name of the theme
 */
export const setTheme = async (name: ShjTerminalTheme) => (theme = import(`./themes/${name}.ts`));
