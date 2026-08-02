/**
 * @module highlight
 * (Base script)
 */

import type {
  ShjDisplayMode,
  ShjLanguage,
  ShjLanguages,
  ShjOptions,
  ShjTheme,
  ShjThemePair,
  ShjToken,
  ShjTokenized,
  ShjTokenizeOptions,
} from "./types.ts";

import expandData from "./common.ts";
import { defaultThemes } from "./defaults.ts";
import { languages } from "./languages.ts";

const sanitize = (str = "") =>
    str.replaceAll("&", "&#38;").replaceAll?.("<", "&lt;").replaceAll?.(">", "&gt;"),
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
  httpBadge = "background:#25f;color:#fff;padding:5px 7px;border-radius:5px";

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
 * @param {ShjLanguages} [langs] Custom languages, looked up before the bundled
 * ones, for the code itself and for its sub-languages
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
      cache: any[] = [],
      i = 0,
      // a custom language wins over a bundled one, and may be a bare definition
      found: any =
        typeof lang === "string" ? (langs?.[lang] ?? (languages as ShjLanguages)[lang]) : lang,
      data = Array.isArray(found) ? { default: found } : found,
      // make a fast shallow copy to bee able to splice lang without change the original one
      arr = [...(typeof lang === "string" ? data.default : lang.sub)];

    while (i < src.length) {
      first.index = null;
      for (m = arr.length; m-- > 0;) {
        part = arr[m].expand ? expandData[arr[m].expand] : arr[m];
        // do not call again exec if the previous result is sufficient
        if (cache[m] === undefined || cache[m].match.index < i) {
          part.match.lastIndex = i;
          match = part.match.exec(src);
          if (match === null) {
            // no more match with this regex can be disposed
            arr.splice(m, 1);
            cache.splice(m, 1);
            continue;
          }
          // save match for later use to decrease performance cost
          cache[m] = { match, lastIndex: part.match.lastIndex };
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
      token(src.slice(i, first.index), data.type);
      i = first.end;
      if (first.part.sub)
        eachToken(
          first.match,
          typeof first.part.sub === "string"
            ? first.part.sub
            : typeof first.part.sub === "function"
              ? first.part.sub(first.match)
              : first.part,
          token,
          langs,
        );
      else token(first.match, first.part.type);
    }
    token(src.slice(i, src.length), data.type);
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
 * The tokens are returned in source order and their `text` is raw — nothing is
 * escaped — so concatenating them gives the input back. Text that no rule
 * matched is returned as a token without a `type`, and an unknown language or
 * a broken grammar yields the whole code as a single untyped token rather than
 * throwing.
 *
 * @example
 * tokenize('let a = 1', { lang: 'js' });
 * // [
 * //   { text: 'let', type: 'kwd' },
 * //   { text: ' a = ' },
 * //   { text: '1', type: 'num' }
 * // ]
 *
 * @example
 * tokenize(code, { lang: 'mine', languages: { mine } });
 *
 * @function tokenize
 * @param {string} code The code
 * @param {ShjTokenizeOptions} [opt={}] Customization options
 * @returns {ShjTokenized[]} The tokens, in source order
 */
export function tokenize(code: string, opt: ShjTokenizeOptions = {}): ShjTokenized[] {
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
 * elm.innerHTML = highlightText(code, { lang: 'js' });
 * elm.innerHTML = highlightText(code, { lang: 'mine', languages: { mine } });
 *
 * @function highlightText
 * @param {string} code The code
 * @param {ShjOptions} [opt={}] Customization options
 * @returns {string} The highlighted string
 */
export function highlightText(code: string, opt: ShjOptions = {}): string {
  const { lang = "plain", theme = defaultThemes, lineNumbers = true } = opt,
    mode = displayMode(code, opt.inline),
    badge = lang == "http" && mode == "oneline";

  let tmp = "";
  eachToken(
    code,
    lang,
    (str, token) => {
      str = sanitize(str);
      if (!token) return (tmp += str);

      const style = badge && token == "kwd" ? httpBadge : tokenStyle(theme, token);
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
 * html += codeToHtml(code, { lang: 'js' });
 * html += codeToHtml(code, { lang: 'js', theme: githubDark });
 * html += codeToHtml(code, { lang: 'mine', languages: { mine } });
 *
 * @function codeToHtml
 * @param {string} code The code
 * @param {ShjOptions} [opt={}] Customization options
 * @returns {string} The markup of the code block
 */
export function codeToHtml(code: string, opt: ShjOptions = {}): string {
  const { lang = "plain", theme = defaultThemes } = opt,
    mode = displayMode(code, opt.inline),
    tag = mode == "inline" ? "code" : "div";

  return `<${tag} class="shj-lang-${attr(lang)} shj-${mode}" data-lang="${attr(lang)}" style="${blockStyle(theme, mode)}">${highlightText(code, { ...opt, lang })}</${tag}>`;
}
