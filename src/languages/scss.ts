import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, CLASS, FUNC, KWD, NUM, OPER, STR, VAR } from "../tokens.ts";
import { str } from "../common.ts";
export default [
  // scss keeps the css block comment and adds the `//` line comment
  [/\/\/.*\n?|\/\*((?!\*\/)[^])*(\*\/)?/g, , "todo"],
  str,
  // an unquoted path would otherwise open a line comment at its `//`
  [
    /url\([^)]*\)/g,
    ,
    [
      [/url(?=\()/g, FUNC],
      [/[^()]+/g, STR],
    ],
  ],
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
  [/\b(true|false|null)\b/g, BOOL],
  // the name `@mixin`, `@include` and `@function` introduce, parentheses or not
  [/(?<=@(?:mixin|include|function)\s+)[\w-]+/g, FUNC],
  // `.class`, `%placeholder`, the `&` parent with whatever is glued to it, and
  // the pseudo classes and elements hanging off any of them — the `(?![\w(-])`
  // is what keeps the `.get` of `map.get()` out of it
  [/[.%]-?[a-zA-Z_][\w-]*(?![\w(-])|&[\w-]*|::?[a-zA-Z][\w-]*(?=[^{};]*(?<!#)\{)/g, CLASS],
  // an id, or a bare element name — a word that still has a block to open (the
  // `{` of an interpolation does not count), and is not sitting where a value
  // goes: after `:`, `(`, `[` or an operator
  [/#[\w-]+(?=[^{};]*(?<!#)\{)|(?<![$@!=:([]\s*)\b[a-z][\w-]*(?=[^{};]*(?<!#)\{)/g, CLASS],
  // a custom property, a property (interpolated or not), a map key, or the
  // name of an attribute selector
  [/--[\w-]+|[\w-]+(?=(#\{[^{}]*\})*\s*[:=])/g, VAR],
  [/#[\da-fA-F]{3,8}\b/g, NUM],
  [
    /(\.\d+|\d+(\.\d+)?)(cm|mm|in|px|pt|pc|em|ex|ch|rem|vmin|vmax|vw|vh|deg|rad|turn|ms|s|fr|%)?/g,
    NUM,
    [[/[a-z]+|%/g, VAR]],
  ],
  // the namespace of a `@use`d module: `math.div`, `map.get`, `cfg.$gutter`
  [/\b[\w-]+(?=\.[$a-zA-Z_-])/g, CLASS],
  [/[\w-]+(?=\s*\()/g, FUNC],
  [/[!<>=+*/~%-]+/g, OPER],
  // whatever is left in a value position: `red`, `none`, `border-box`
  [/\b[a-z-]+\b/g, NUM],
] as ShjLanguageDefinition;
