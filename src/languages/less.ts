import type { ShjLanguageComponent, ShjLanguageDefinition } from "../types.ts";
import { FUNC, KWD, OPER, STR, VAR } from "../tokens.ts";
import { str } from "../common.ts";
import { bool, comment, elem, func, hex, oper, prop, sel, unit, url, word } from "./scss.ts";

// `@{name}` interpolates anywhere — selector, property name, value, and inside
// a string — and the braces are punctuation, not part of the name. The path of
// a `url()` is the one place it stays plain: there it is part of the string.
const interpolation: ShjLanguageComponent = [/@\{[^{}]*\}?/g, OPER, [[/[\w-]+/g, VAR]]];

export default [
  comment,
  // the very pattern of `str`, with the interpolation a Less string may carry
  [str[0], STR, [interpolation]],
  // `~"…"` escapes a value and `` `…` `` evaluates JavaScript: the `~` is left
  // to the operator rule, the backticked source is a literal like any other
  [/`[^`]*`?/g, STR],
  url,
  interpolation,
  // the at-rules, spelled out: `@name` is a variable in Less, so `@media` can
  // only be told from `@primary` by the name itself — and by the `:` that a
  // declaration of a variable named after an at-rule would still bring
  [
    /@(media|import|charset|namespace|supports|keyframes|font-face|page|plugin|layer|container|property|counter-style|-[\w-]+)(?![\w-]|\s*:)|![\w-]+|(?<![\w-])(and|not|only|or|when|reference|inline|once|multiple|optional)(?![\w-])/g,
    KWD,
  ],
  bool,
  // a variable, its `@@name` indirection, and the `$name` property accessor
  [/[$@]@?[\w-]+/g, VAR],
  sel,
  elem,
  prop,
  hex,
  // a mixin, called or declared, and the `#namespace` a call reaches through
  [/[.#][\w-]+(?=\s*\()|#[\w-]+(?=\s*>)/g, FUNC],
  unit,
  func,
  oper,
  word,
] as ShjLanguageDefinition;
