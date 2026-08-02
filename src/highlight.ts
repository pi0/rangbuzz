/**
 * @module highlight
 * (Base script)
 *
 * The engine itself, which pulls in no grammar and no theme: both are handed
 * over per call. This is what `rangi/core` exposes; the main entry wraps it
 * with the bundled languages and themes.
 */

import type {
  ShjCoreOptions,
  ShjCoreTokenizeOptions,
  ShjDisplayMode,
  ShjLanguage,
  ShjLanguages,
  ShjTheme,
  ShjThemePair,
  ShjToken,
  ShjTokenized,
} from "./types.ts";

import { TOKENS } from "./tokens.ts";

const sanitize = (str = "") =>
    // most tokens carry none of the three, and the test is one pass where the
    // replacements are three passes and two intermediate strings
    /[&<>]/.test(str)
      ? str.replaceAll("&", "&#38;").replaceAll?.("<", "&lt;").replaceAll?.(">", "&gt;")
      : str,
  /**
   * Sanitize a string used as an attribute value
   *
   * @function
   * @ignore
   */
  attr = (str: string) => sanitize(str).replaceAll('"', "&#34;"),
  // single quoted: this ends up inside a double quoted `style` attribute
  font = "normal 18px Consolas,'Courier New',Monaco,'Andale Mono','Ubuntu Mono',monospace",
  /**
   * Read a color of the theme, pairing a light and a dark theme with `light-dark()`
   *
   * @function
   * @ignore
   * @param {ShjTheme|ShjThemePair} theme The theme
   * @param {function(ShjTheme): (string|undefined)} pick The color to read
   * @returns A css color
   */
  color = (theme: ShjTheme | ShjThemePair, pick: (theme: ShjTheme) => string | undefined) => {
    if (!("light" in theme)) return pick(theme);

    const light = pick(theme.light),
      dark = pick(theme.dark);
    return light && dark && light != dark ? `light-dark(${light},${dark})` : (light ?? dark);
  },
  /**
   * The styles of a single token
   *
   * @function
   * @ignore
   * @param {ShjTheme|ShjThemePair} theme The theme
   * @param {ShjToken} token The type of token
   * @returns Css declarations
   */
  tokenStyle = (theme: ShjTheme | ShjThemePair, token: ShjToken) => {
    const value = color(theme, (theme) => theme.tokens[token]);
    return [value && `color:${value}`, token == "cmnt" && "font-style:italic"]
      .filter(Boolean)
      .join(";");
  },
  /**
   * The line numbers gutter
   *
   * @function
   * @ignore
   * @param {number} lines The number of lines
   * @param {ShjTheme|ShjThemePair} theme The theme
   * @returns A HTML string
   */
  gutter = (lines: number, theme: ShjTheme | ShjThemePair) =>
    `<div class="shj-numbers" style="padding-left:5px;padding-right:10px;text-align:right;opacity:0.5;user-select:none;color:${color(theme, (theme) => theme.numbers ?? theme.tokens.cmnt) ?? "inherit"}">${Array.from({ length: lines }, (_, i) => `<div>${i + 1}</div>`).join("")}</div>`,
  // one line http requests display their method as a badge
  httpBadge = "background:#25f;color:#fff;padding:5px 7px;border-radius:5px",
  /**
   * The name of a token type, which a bundled grammar refers to by its index
   *
   * A custom language may name its types instead, and name one that is not
   * bundled, so anything that is not a number is passed through untouched.
   *
   * @function
   * @ignore
   */
  tokenName = (type: any): ShjToken | undefined => (typeof type == "number" ? TOKENS[type] : type);

/**
 * The display mode a code is rendered with
 *
 * @function displayMode
 * @ignore
 */
export const displayMode = (code: string, inline?: boolean): ShjDisplayMode =>
  inline ? "inline" : code.includes("\n") ? "multiline" : "oneline";

/**
 * The styles of the code block itself
 *
 * `color-scheme` is inherited by the tokens, which is what makes the
 * `light-dark()` colors of a theme pair resolve.
 *
 * @function blockStyle
 * @ignore
 * @param {ShjTheme|ShjThemePair} theme The theme
 * @param {ShjDisplayMode} mode The display mode
 * @returns Css declarations
 */
export const blockStyle = (theme: ShjTheme | ShjThemePair, mode: ShjDisplayMode): string => {
  const scheme = "light" in theme ? "light dark" : theme.scheme;

  return (
    `white-space:pre;box-sizing:border-box;max-width:min(100%,100vw);font:${font};line-height:24px;${scheme ? `color-scheme:${scheme};` : ""}background:${color(theme, (theme) => theme.bg)};color:${color(theme, (theme) => theme.fg)};box-shadow:0 0 5px #0001;text-shadow:none;` +
    (mode == "inline"
      ? "display:inline-block;margin:0;padding:2px 5px;border-radius:5px"
      : `margin:10px 0;padding:${mode == "oneline" ? "12px 10px" : "30px 20px"};border-radius:10px`)
  );
};

/**
 * Find the tokens in the given code and call the given callback
 *
 * This is the rule engine itself; {@link tokenize} is the public wrapper
 * around it.
 *
 * @function eachToken
 * @ignore
 * @param {string} src The code
 * @param {ShjLanguage|Array} lang The language of the code
 * @param {function(string, ShjToken=):void} token The callback function
 * this function will be given
 * * the text of the token
 * * the type of the token
 * @param {ShjLanguages} [langs] The languages, for the code itself and for its
 * sub-languages
 */
export function eachToken(
  src: string,
  lang: ShjLanguage | any,
  token: (str: string, token?: ShjToken) => void,
  langs?: ShjLanguages,
) {
  try {
    let m,
      part,
      first: any = {},
      match,
      sub,
      cache: any[] = [],
      i = 0,
      // a named language is looked up in the registry the caller handed over,
      // and may be a bare definition or a module carrying a `type`. Anything
      // else is a rule tuple we recursed into, whose `sub` holds the rules.
      named = typeof lang === "string",
      found: any = named ? langs?.[lang] : 0,
      data: any = named
        ? Array.isArray(found)
          ? { default: found }
          : found
        : { default: lang[2], type: lang[1] },
      // the type the rules of this language leave unmatched text with
      type = tokenName(data.type),
      // make a fast shallow copy to bee able to splice lang without change the original one
      arr = [...data.default];

    while (i < src.length) {
      first.index = null;
      for (m = arr.length; m-- > 0;) {
        part = arr[m];
        // do not call again exec if the previous result is sufficient
        if (cache[m] === undefined || cache[m].match.index < i) {
          part[0].lastIndex = i;
          match = part[0].exec(src);
          if (match === null) {
            // no more match with this regex can be disposed
            arr.splice(m, 1);
            cache.splice(m, 1);
            continue;
          }
          // save match for later use to decrease performance cost
          cache[m] = { match, lastIndex: part[0].lastIndex };
        }
        // check if it the first match in the string
        if (cache[m].match[0] && (cache[m].match.index <= first.index || first.index === null))
          first = {
            part: part,
            index: cache[m].match.index,
            match: cache[m].match[0],
            end: cache[m].lastIndex,
          };
      }
      if (first.index === null) break;
      token(src.slice(i, first.index), type);
      i = first.end;
      sub = first.part[2];
      if (sub)
        eachToken(
          first.match,
          typeof sub === "string" ? sub : typeof sub === "function" ? sub(first.match) : first.part,
          token,
          langs,
        );
      else token(first.match, tokenName(first.part[1]));
    }
    token(src.slice(i, src.length), type);
  } catch {
    token(src);
  }
}

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
 * The `type` is the key a {@link ShjTheme} assigns a color to. The one style
 * the theme does not carry is the italic `cmnt` is rendered with in html,
 * which is a convention of that output rather than theme data.
 *
 * @example
 * tokenize('let a = 1', { lang: 'js', languages: { js } });
 * // [
 * //   { text: 'let', type: 'kwd' },
 * //   { text: ' a ' },
 * //   { text: '=', type: 'oper' },
 * //   { text: ' ' },
 * //   { text: '1', type: 'num' }
 * // ]
 *
 * @example
 * // the registry applies to sub-languages too
 * tokenize(code, { lang: 'mine', languages: { mine } });
 *
 * @example
 * // group into lines, keeping tokens that span a break intact
 * const lines = [[]];
 * for (const { text, type } of tokenize(code, { lang: 'js', languages: { js } }))
 *   text.split('\n').forEach((part, i) => {
 *     if (i) lines.push([]);
 *     if (part) lines.at(-1).push({ text: part, type });
 *   });
 *
 * @function tokenize
 * @param {string} code The code
 * @param {ShjCoreTokenizeOptions} opt Customization options
 * @returns {ShjTokenized[]} The tokens, in source order
 */
export function tokenize(code: string, opt: ShjCoreTokenizeOptions): ShjTokenized[] {
  const tokens: ShjTokenized[] = [];
  eachToken(
    code,
    opt.lang ?? "plain",
    (text, type) => {
      // the engine emits empty slices between adjacent matches
      if (text) tokens.push(type ? { text, type } : { text });
    },
    opt.languages,
  );

  return tokens;
}

/**
 * Highlight a string and return the content of a code block: the tokens, and
 * the line numbers when the code is multiline
 *
 * Use {@link codeToHtml} to get the code block itself.
 *
 * @example
 * elm.innerHTML = highlightText(code, { lang: 'js', languages: { js }, theme: dark });
 *
 * @function highlightText
 * @param {string} code The code
 * @param {ShjCoreOptions} opt Customization options
 * @returns {string} The highlighted string
 */
export function highlightText(code: string, opt: ShjCoreOptions): string {
  const { lang = "plain", theme, lineNumbers = true } = opt,
    mode = displayMode(code, opt.inline),
    badge = lang == "http" && mode == "oneline";

  let tmp = "";
  // the theme is read once per token *type*, not once per token: a block has a
  // handful of types and hundreds of tokens, and the styles of a type are the
  // same string every time. Per call rather than module level, so a theme that
  // is mutated between two calls still takes effect.
  const styles: Partial<Record<ShjToken, string>> = {};

  eachToken(
    code,
    lang,
    (str, token) => {
      str = sanitize(str);
      if (!token) return (tmp += str);

      const style =
        badge && token == "kwd" ? httpBadge : (styles[token] ??= tokenStyle(theme, token));
      tmp += style ? `<span style="${style}">${str}</span>` : str;
    },
    opt.languages,
  );

  return mode == "multiline"
    ? `<div style="display:flex;overflow:auto">${lineNumbers ? gutter(code.split("\n").length, theme) : ""}<div style="flex:1;outline:none">${tmp}</div></div>`
    : tmp;
}

/**
 * Highlight a string and return the markup of a complete code block
 *
 * The colors of the theme are inlined, so the result is self contained and
 * needs no stylesheet.
 *
 * @example
 * html += codeToHtml(code, { lang: 'js', languages: { js }, theme: githubDark });
 * html += codeToHtml(code, { lang: 'mine', languages: { mine }, theme: githubDark });
 *
 * @function codeToHtml
 * @param {string} code The code
 * @param {ShjCoreOptions} opt Customization options
 * @returns {string} The markup of the code block
 */
export function codeToHtml(code: string, opt: ShjCoreOptions): string {
  const { lang = "plain", theme } = opt,
    mode = displayMode(code, opt.inline),
    tag = mode == "inline" ? "code" : "div";

  return `<${tag} class="shj-lang-${attr(lang)} shj-${mode}" data-lang="${attr(lang)}" style="${blockStyle(theme, mode)}">${highlightText(code, { ...opt, lang })}</${tag}>`;
}
