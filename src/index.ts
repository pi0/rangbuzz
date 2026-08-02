/**
 * @module index
 * (The main entry)
 *
 * The same functions as `rangbuzz/core`, with what that entry asks for
 * explicitly filled in: every bundled grammar, and the two bundled themes.
 */

import type {
  ShjCoreOptions,
  ShjOptions,
  ShjTerminalOptions,
  ShjTokenized,
  ShjTokenizeOptions,
} from "./types.ts";

import { defaultThemes } from "./defaults.ts";
import {
  codeToHtml as coreCodeToHtml,
  highlightText as coreHighlightText,
  tokenize as coreTokenize,
} from "./highlight.ts";
import { languages } from "./languages.ts";
import { codeToAnsi as coreCodeToAnsi } from "./terminal.ts";

/**
 * Fill in what the core entry takes explicitly
 *
 * Custom languages are merged over the bundled ones, so they are still looked
 * up first, and still apply to sub-languages.
 *
 * @function
 * @ignore
 */
const bundled = (opt: ShjOptions): ShjCoreOptions => ({
  ...opt,
  languages: opt.languages ? { ...languages, ...opt.languages } : languages,
  theme: opt.theme ?? defaultThemes,
});

/**
 * Split a string into its tokens, without rendering anything
 *
 * This is the layer every other function is built on: use it to render the
 * tokens yourself, to feed another output format, or to inspect a grammar.
 *
 * The tokens are returned in source order, never empty, and their `text` is
 * raw — nothing is escaped — so concatenating them gives the input back. Text
 * that no rule matched is returned as a token without a `type`, and an unknown
 * language or a broken grammar yields the whole code as a single untyped token
 * rather than throwing.
 *
 * A token may span line breaks: a block comment, a template literal or a run
 * of plain text is one token however many lines it covers. To render per line,
 * tokenize the whole code once and split the tokens on `\n` — tokenizing each
 * line on its own silently mis-highlights everything that crosses a break.
 *
 * @example
 * tokenize('let a = 1', { lang: 'js' });
 * // [
 * //   { text: 'let', type: 'kwd' },
 * //   { text: ' a ' },
 * //   { text: '=', type: 'oper' },
 * //   { text: ' ' },
 * //   { text: '1', type: 'num' }
 * // ]
 *
 * @example
 * // custom languages apply to sub-languages too
 * tokenize(code, { lang: 'mine', languages: { mine } });
 *
 * @function tokenize
 * @param {string} code The code
 * @param {ShjTokenizeOptions} [opt={}] Customization options
 * @returns {ShjTokenized[]} The tokens, in source order
 */
export const tokenize = (code: string, opt: ShjTokenizeOptions = {}): ShjTokenized[] =>
  coreTokenize(code, bundled(opt));

/**
 * Highlight a string and return the content of a code block: the tokens, and
 * the line numbers when the code is multiline
 *
 * Use {@link codeToHtml} to get the code block itself.
 *
 * @example
 * elm.innerHTML = highlightText(code, { lang: 'js' });
 * elm.innerHTML = highlightText(code, { lang: 'mine', languages: { mine } });
 *
 * @function highlightText
 * @param {string} code The code
 * @param {ShjOptions} [opt={}] Customization options
 * @returns {string} The highlighted string
 */
export const highlightText = (code: string, opt: ShjOptions = {}): string =>
  coreHighlightText(code, bundled(opt));

/**
 * Highlight a string and return the markup of a complete code block
 *
 * The colors of the theme are inlined, so the result is self contained and
 * needs no stylesheet.
 *
 * @example
 * html += codeToHtml(code, { lang: 'js' });
 * html += codeToHtml(code, { lang: 'js', theme: githubDark });
 * html += codeToHtml(code, { lang: 'mine', languages: { mine } });
 *
 * @function codeToHtml
 * @param {string} code The code
 * @param {ShjOptions} [opt={}] Customization options
 * @returns {string} The markup of the code block
 */
export const codeToHtml = (code: string, opt: ShjOptions = {}): string =>
  coreCodeToHtml(code, bundled(opt));

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
export const codeToAnsi = (code: string, opt: ShjTerminalOptions = {}): string =>
  coreCodeToAnsi(code, bundled(opt));

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

export { detectLanguage } from "./detect.ts";
export type * from "./types.ts";
