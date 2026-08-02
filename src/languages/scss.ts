import type { ShjLanguageComponent, ShjLanguageDefinition } from "../types.ts";
import { BOOL, CLASS, FUNC, KWD, NUM, OPER, STR, VAR } from "../tokens.ts";
import { str } from "../common.ts";

/**
 * The rules Scss shares with Less, exported so the two grammars are the very
 * same tuples rather than two copies of them.
 *
 * The two dialects differ only in how they spell a variable (`$name` against
 * `@name`) and an interpolation (`#{…}` against `@{…}`), so every rule that
 * mentions neither is shared as is, and the two that mention an interpolation
 * accept either sigil — `@{` never opens a block in Scss and `#{` never does in
 * Less, so widening the character class costs nothing on either side.
 */
// the css block comment, plus the `//` line comment both dialects add
export const comment: ShjLanguageComponent = [/\/\/.*\n?|\/\*((?!\*\/)[^])*(\*\/)?/g, , "todo"],
  // an unquoted path would otherwise open a line comment at its `//`
  url: ShjLanguageComponent = [
    /url\([^)]*\)/g,
    ,
    [
      [/url(?=\()/g, FUNC],
      [/[^()]+/g, STR],
    ],
  ],
  bool: ShjLanguageComponent = [/\b(true|false|null)\b/g, BOOL],
  // `.class`, `%placeholder`, the `&` parent with whatever is glued to it, and
  // the pseudo classes and elements hanging off any of them — the `(?![\w(-])`
  // is what keeps the `.get` of `map.get()`, and a `.mixin()` call, out of it
  sel: ShjLanguageComponent = [
    /[.%]-?[a-zA-Z_][\w-]*(?![\w(-])|&[\w-]*|::?[a-zA-Z][\w-]*(?=[^{};]*(?<![#@])\{)/g,
    CLASS,
  ],
  // an id, or a bare element name — a word that still has a block to open (the
  // `{` of an interpolation does not count), and is not sitting where a value
  // goes: after `:`, `(`, `[` or an operator
  elem: ShjLanguageComponent = [
    /#[\w-]+(?=[^{};]*(?<![#@])\{)|(?<![$@!=:([]\s*)\b[a-z][\w-]*(?=[^{};]*(?<![#@])\{)/g,
    CLASS,
  ],
  // a custom property, a property (interpolated or not), a map key, or the
  // name of an attribute selector
  prop: ShjLanguageComponent = [/--[\w-]+|[\w-]+(?=([#@]\{[^{}]*\})*\s*[:=])/g, VAR],
  hex: ShjLanguageComponent = [/#[\da-fA-F]{3,8}\b/g, NUM],
  unit: ShjLanguageComponent = [
    /(\.\d+|\d+(\.\d+)?)(cm|mm|in|px|pt|pc|em|ex|ch|rem|vmin|vmax|vw|vh|deg|rad|turn|ms|s|fr|%)?/g,
    NUM,
    [[/[a-z]+|%/g, VAR]],
  ],
  func: ShjLanguageComponent = [/[\w-]+(?=\s*\()/g, FUNC],
  oper: ShjLanguageComponent = [/[!<>=+*/~%-]+/g, OPER],
  // whatever is left in a value position: `red`, `none`, `border-box`
  word: ShjLanguageComponent = [/\b[a-z-]+\b/g, NUM];

export default [
  comment,
  str,
  url,
  // `#{…}` interpolates anywhere — selector, property name or value — and the
  // braces themselves are punctuation, not part of the name
  [
    /#\{[^{}]*\}?/g,
    OPER,
    [
      [/\$[\w-]+/g, VAR],
      [/[\w-]+(?=\s*\()/g, FUNC],
    ],
  ],
  [/\$[\w-]+/g, VAR],
  // every at-rule, the `!default`/`!global`/`!important` flags, and the words
  // the control directives and `@media` queries are written with
  [
    /@[\w-]+|![\w-]+|\b(and|as|else|from|hide|if|in|not|only|or|show|through|to|using|with)\b/g,
    KWD,
  ],
  bool,
  // the name `@mixin`, `@include` and `@function` introduce, parentheses or not
  [/(?<=@(?:mixin|include|function)\s+)[\w-]+/g, FUNC],
  sel,
  elem,
  prop,
  hex,
  unit,
  // the namespace of a `@use`d module: `math.div`, `map.get`, `cfg.$gutter`
  [/\b[\w-]+(?=\.[$a-zA-Z_-])/g, CLASS],
  func,
  oper,
  word,
] as ShjLanguageDefinition;
