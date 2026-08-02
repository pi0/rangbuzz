import type { ShjLanguageDefinition } from "../types.ts";
export default [
  {
    // scss keeps the css block comment and adds the `//` line comment
    match: /\/\/.*\n?|\/\*((?!\*\/)[^])*(\*\/)?/g,
    sub: "todo",
  },
  {
    expand: "str",
  },
  {
    // an unquoted path would otherwise open a line comment at its `//`
    match: /url\([^)]*\)/g,
    sub: [
      {
        type: "func",
        match: /url(?=\()/g,
      },
      {
        type: "str",
        match: /[^()]+/g,
      },
    ],
  },
  {
    // `#{…}` interpolates anywhere — selector, property name or value — and the
    // braces themselves are punctuation, not part of the name
    type: "oper",
    match: /#\{[^{}]*\}?/g,
    sub: [
      {
        type: "var",
        match: /\$[\w-]+/g,
      },
      {
        type: "func",
        match: /[\w-]+(?=\s*\()/g,
      },
    ],
  },
  {
    type: "var",
    match: /\$[\w-]+/g,
  },
  {
    // every at-rule, the `!default`/`!global`/`!important` flags, and the words
    // the control directives and `@media` queries are written with
    type: "kwd",
    match:
      /@[\w-]+|![\w-]+|\b(and|as|else|from|hide|if|in|not|only|or|show|through|to|using|with)\b/g,
  },
  {
    type: "bool",
    match: /\b(true|false|null)\b/g,
  },
  {
    // the name `@mixin`, `@include` and `@function` introduce, parentheses or not
    type: "func",
    match: /(?<=@(?:mixin|include|function)\s+)[\w-]+/g,
  },
  {
    // `.class`, `%placeholder`, the `&` parent with whatever is glued to it, and
    // the pseudo classes and elements hanging off any of them — the `(?![\w(-])`
    // is what keeps the `.get` of `map.get()` out of it
    type: "class",
    match: /[.%]-?[a-zA-Z_][\w-]*(?![\w(-])|&[\w-]*|::?[a-zA-Z][\w-]*(?=[^{};]*(?<!#)\{)/g,
  },
  {
    // an id, or a bare element name — a word that still has a block to open (the
    // `{` of an interpolation does not count), and is not sitting where a value
    // goes: after `:`, `(`, `[` or an operator
    type: "class",
    match: /#[\w-]+(?=[^{};]*(?<!#)\{)|(?<![$@!=:([]\s*)\b[a-z][\w-]*(?=[^{};]*(?<!#)\{)/g,
  },
  {
    // a custom property, a property (interpolated or not), a map key, or the
    // name of an attribute selector
    type: "var",
    match: /--[\w-]+|[\w-]+(?=(#\{[^{}]*\})*\s*[:=])/g,
  },
  {
    type: "num",
    match: /#[\da-fA-F]{3,8}\b/g,
  },
  {
    type: "num",
    match:
      /(\.\d+|\d+(\.\d+)?)(cm|mm|in|px|pt|pc|em|ex|ch|rem|vmin|vmax|vw|vh|deg|rad|turn|ms|s|fr|%)?/g,
    sub: [
      {
        type: "var",
        match: /[a-z]+|%/g,
      },
    ],
  },
  {
    // the namespace of a `@use`d module: `math.div`, `map.get`, `cfg.$gutter`
    type: "class",
    match: /\b[\w-]+(?=\.[$a-zA-Z_-])/g,
  },
  {
    type: "func",
    match: /[\w-]+(?=\s*\()/g,
  },
  {
    type: "oper",
    match: /[!<>=+*/~%-]+/g,
  },
  {
    // whatever is left in a value position: `red`, `none`, `border-box`
    type: "num",
    match: /\b[a-z-]+\b/g,
  },
] as ShjLanguageDefinition;
