import type { ShjLanguageDefinition } from "../types.ts";

// inside a doc comment, `[Reference]` points at a symbol
const doc = [
    {
      type: "class",
      match: /\[[\w.<>$]+\]/g,
    },
    {
      type: "err",
      match: /\b(TODO|FIXME|BUG|XXX|HACK)\b/g,
    },
  ],
  // `${…}` holds an expression, which may itself hold quotes and one level of
  // braces — a quote in there must not be able to end the string around it
  interp = /\$\{(?:[^{}'"\r\n]|'(?:\\[^]|[^'\r\n])*'|"(?:\\[^]|[^"\r\n])*"|\{[^{}]*\})*\}/.source,
  // what a non raw string carries: escapes, `$name` and `${expr}` interpolation
  inside = [
    {
      type: "esc",
      match: /\\(u\{[\da-fA-F]{1,6}\}|u[\da-fA-F]{4}|x[\da-fA-F]{2}|[^])/g,
    },
    {
      type: "var",
      match: new RegExp(`${interp}|\\$\\w+`, "g"),
      // the `${` and the `}` stay `var`, whatever they wrap is Dart again
      sub: [
        {
          match: /(?!^\$|\{)[^]+(?=\}$)/g,
          sub: "dart",
        },
      ],
    },
  ];

export default [
  {
    // `///` doc comments, before the `//` rule can claim them
    type: "cmnt",
    match: /\/\/\/.*\n?/g,
    sub: doc,
  },
  {
    match: /\/\/.*\n?/g,
    sub: "todo",
  },
  {
    // Dart block comments nest, which no regular expression can follow
    match: new (class {
      lastIndex = 0;
      exec(str: string) {
        let i = str.indexOf("/*", this.lastIndex),
          depth = 1,
          j = i + 2;
        if (i < 0) return null;
        while (j < str.length && depth) {
          const step = str.startsWith("/*", j) ? 1 : str.startsWith("*/", j) ? -1 : 0;
          depth += step;
          j += step ? 2 : 1;
        }
        this.lastIndex = j;
        return { index: i, 0: str.slice(i, j) };
      }
    })(),
    // `/** … */` is a doc comment, any other block comment is not
    sub: (code: string) => (code.startsWith("/**") ? { type: "cmnt", sub: doc } : "todo"),
  },
  {
    // raw strings: neither escapes nor interpolation apply inside them
    type: "str",
    match: /\br("""|''')((?!\1)[^])*\1?|\br(["'])((?!\3)[^\r\n])*\3?/g,
  },
  {
    // triple quoted, before the plain rule can stop at the first quote
    type: "str",
    match: /("""|''')(\\[^]|(?!\1)[^])*\1?/g,
    sub: inside,
  },
  {
    type: "str",
    match: new RegExp(`(["'])(?:\\\\[^]|${interp}|(?!\\1)[^\\r\\n\\\\])*\\1?`, "g"),
    sub: inside,
  },
  {
    type: "num",
    match: /\b0[xX][\da-fA-F_]+|(\b\d[\d_]*(\.\d[\d_]*)?|\.\d[\d_]*)([eE][+-]?\d+)?/g,
  },
  {
    type: "bool",
    match: /\b(true|false|null)\b/g,
  },
  {
    type: "type",
    match: /\b(bool|double|int|num)\b/g,
  },
  {
    type: "kwd",
    // `get`, `set`, `on`, `hide` … are contextual: after a dot they are members
    match:
      /(?<!\.)\b((async|sync|yield)\*|(abstract|as|assert|async|await|base|break|case|catch|class|const|continue|covariant|deferred|default|do|dynamic|else|enum|export|extends|extension|external|factory|final|finally|for|get|hide|if|implements|import|in|interface|is|late|library|mixin|new|on|operator|part|required|rethrow|return|sealed|set|show|static|super|switch|sync|this|throw|try|typedef|var|void|when|while|with|yield)\b)/g,
  },
  {
    // annotations: `@override`, `@Deprecated('…')`
    type: "var",
    match: /@\w+/g,
  },
  {
    type: "oper",
    match: /[/*+:?&|%^~=!,<>.^-]+/g,
  },
  {
    type: "func",
    match: /[a-zA-Z_$][\w$]*(?=\s*\()/g,
  },
  {
    type: "class",
    match: /\b_?[A-Z][\w$]*\b/g,
  },
] as ShjLanguageDefinition;
