/**
 * @module terminal
 * (Terminal adaptor)
 */

import type { ShjTerminalOptions } from "./types.ts";

import { defaultThemes } from "./defaults.ts";
import { tokenize } from "./highlight.ts";

/**
 * Turn a `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa` color into a 24 bit
 * foreground escape sequence (the alpha channel is ignored)
 *
 * @function
 * @ignore
 */
const escapeSequence = (color: string) => {
  let hex = color.replace("#", "");
  if (hex.length < 6) hex = [...hex].map((digit) => digit + digit).join("");

  return `\x1b[38;2;${Number.parseInt(hex.slice(0, 2), 16)};${Number.parseInt(hex.slice(2, 4), 16)};${Number.parseInt(hex.slice(4, 6), 16)}m`;
};

/**
 * Highlight a string and return a string that can directly be printed
 *
 * The colors of the theme are emitted as 24 bit escape sequences.
 *
 * @example
 * console.log(codeToAnsi(code, { lang: 'js', theme: atomDark }));
 *
 * @function codeToAnsi
 * @param {string} code The code
 * @param {ShjTerminalOptions} [opt={}] Customization options
 * @returns {string} The highlighted string
 */
export function codeToAnsi(code: string, opt: ShjTerminalOptions = {}): string {
  // a terminal has no color scheme to follow: a pair is read as its dark theme
  const given = opt.theme ?? defaultThemes,
    theme = "light" in given ? given.dark : given;

  let res = "";
  tokenize(code, opt.lang ?? "plain", (str, token) => {
    const color = token && theme.tokens[token];
    res += color ? `${escapeSequence(color)}${str}\x1b[0m` : str;
  });

  return res;
}

/**
 * Highlight and print a given string
 *
 * @example
 * printHighlight(code, { lang: 'js' });
 *
 * @function printHighlight
 * @param {string} code The code
 * @param {ShjTerminalOptions} [opt={}] Customization options
 */
export const printHighlight = (code: string, opt?: ShjTerminalOptions) =>
  console.log(codeToAnsi(code, opt));
