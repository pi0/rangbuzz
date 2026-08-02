/**
 * @module index
 * (Base script)
 */

import type {
  ShjDisplayMode,
  ShjLanguage,
  ShjLanguageDefinition,
  ShjOptions,
  ShjToken,
} from "./types.ts";

import expandData from "./common.ts";
import { languages } from "./languages.ts";

const langs: Record<string, any> = { ...languages },
  sanitize = (str = "") =>
    str.replaceAll("&", "&#38;").replaceAll?.("<", "&lt;").replaceAll?.(">", "&gt;"),
  /**
   * Create a HTML element with the right token styling
   *
   * @function
   * @ignore
   * @param {string} str The content (need to be sanitized)
   * @param {ShjToken} [token] The type of token
   * @returns A HMTL string
   */
  toSpan = (str: string, token?: ShjToken) =>
    token ? `<span class="shj-syn-${token}">${str}</span>` : str;

/**
 * Find the tokens in the given code and call the given callback
 *
 * @function tokenize
 * @param {string} src The code
 * @param {ShjLanguage|Array} lang The language of the code
 * @param {function(string, ShjToken=):void} token The callback function
 * this function will be given
 * * the text of the token
 * * the type of the token
 */
export function tokenize(
  src: string,
  lang: ShjLanguage | any,
  token: (str: string, token?: ShjToken) => void,
) {
  try {
    let m,
      part,
      first: any = {},
      match,
      cache: any[] = [],
      i = 0,
      data = typeof lang === "string" ? langs[lang] : lang,
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
        tokenize(
          first.match,
          typeof first.part.sub === "string"
            ? first.part.sub
            : typeof first.part.sub === "function"
              ? first.part.sub(first.match)
              : first.part,
          token,
        );
      else token(first.match, first.part.type);
    }
    token(src.slice(i, src.length), data.type);
  } catch {
    token(src);
  }
}

/**
 * Highlight a string passed as argument and return it
 * @example
 * elm.innerHTML = highlightText(code, 'js');
 *
 * @function highlightText
 * @param {string} src The code
 * @param {ShjLanguage} lang The language of the code
 * @param {Boolean} [multiline=true] If it is multiline, it will add a wrapper for the line numbering and header
 * @param {ShjOptions} [opt={}] Customization options
 * @returns {string} The highlighted string
 */
export function highlightText(
  src: string,
  lang: ShjLanguage,
  multiline = true,
  opt: ShjOptions = {},
) {
  let tmp = "";
  tokenize(src, lang, (str, type) => (tmp += toSpan(sanitize(str), type)));

  return multiline
    ? `<div><div class="shj-numbers">${"<div></div>".repeat(opt.hideLineNumbers ? 0 : src.split("\n").length)}</div><div>${tmp}</div></div>`
    : tmp;
}

/**
 * Highlight a DOM element by getting the new innerHTML with highlightText
 *
 * @function highlightElement
 * @param {Element} elm The DOM element
 * @param {ShjLanguage} [lang] The language of the code (seaching by default on `elm` for a 'shj-lang-' class)
 * @param {ShjDisplayMode} [mode] The display mode (guessed by default)
 * @param {ShjOptions} [opt={}] Customization options
 */
export function highlightElement(
  elm: HTMLElement,
  lang = elm.className.match(/shj-lang-([\w-]+)/)?.[1] as ShjLanguage,
  mode?: ShjDisplayMode,
  opt?: ShjOptions,
) {
  let txt = elm.textContent!;
  mode ??=
    `${elm.tagName == "CODE" ? "in" : txt.split("\n").length < 2 ? "one" : "multi"}line` as ShjDisplayMode;
  elm.dataset.lang = lang;
  elm.className = `${[...elm.classList].filter((className) => !className.startsWith("shj-")).join(" ")} shj-lang-${lang} shj-${mode}`;
  elm.innerHTML = highlightText(txt, lang, mode == "multiline", opt);
}

/**
 * Call highlightElement on element with a css class starting with `shj-lang-`
 *
 * @function highlightAll
 * @param {ShjOptions} [opt={}] Customization options
 */
export let highlightAll = (opt?: ShjOptions) => {
  for (const elm of document.querySelectorAll<HTMLElement>('[class*="shj-lang-"]'))
    highlightElement(elm, undefined, undefined, opt);
};

/**
 * Load a language and add it to the langs object
 *
 * Every language listed in {@link ShjLanguage} is bundled and registered
 * already; this is only needed for custom languages or to override a bundled one.
 *
 * @function loadLanguage
 * @param {string} languageName The name of the language
 * @param {{ default: ShjLanguageDefinition }} language The language
 */
export let loadLanguage = (languageName: string, language: { default: ShjLanguageDefinition }) => {
  langs[languageName] = language;
};
