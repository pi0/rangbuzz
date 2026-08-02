import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, CLASS, CMNT, ERR, ESC, FUNC, KWD, NUM, OPER, STR, TYPE, VAR } from "../tokens.ts";

// inside a doc comment, `[Reference]` points at a symbol
const doc = [
    [/\[[\w.<>$]+\]/g, CLASS],
    [/\b(TODO|FIXME|BUG|XXX|HACK)\b/g, ERR],
  ],
  // `${…}` holds an expression, which may itself hold quotes and one level of
  // braces — a quote in there must not be able to end the string around it
  interp = /\$\{(?:[^{}'"\r\n]|'(?:\\[^]|[^'\r\n])*'|"(?:\\[^]|[^"\r\n])*"|\{[^{}]*\})*\}/.source,
  // what a non raw string carries: escapes, `$name` and `${expr}` interpolation
  inside = [
    [/\\(u\{[\da-fA-F]{1,6}\}|u[\da-fA-F]{4}|x[\da-fA-F]{2}|[^])/g, ESC],
    // the `${` and the `}` stay `var`, whatever they wrap is Dart again
    [new RegExp(`${interp}|\\$\\w+`, "g"), VAR, [[/(?!^\$|\{)[^]+(?=\}$)/g, , "dart"]]],
  ];

export default [
  // `///` doc comments, before the `//` rule can claim them
  [/\/\/\/.*\n?/g, CMNT, doc],
  [/\/\/.*\n?/g, , "todo"],
  // Dart block comments nest, which no regular expression can follow
  // `/** … */` is a doc comment, any other block comment is not
  [
    new (class {
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
    ,
    (code: string) => (code.startsWith("/**") ? [, CMNT, doc] : "todo"),
  ],
  // raw strings: neither escapes nor interpolation apply inside them
  [/\br("""|''')((?!\1)[^])*\1?|\br(["'])((?!\3)[^\r\n])*\3?/g, STR],
  // triple quoted, before the plain rule can stop at the first quote
  [/("""|''')(\\[^]|(?!\1)[^])*\1?/g, STR, inside],
  [new RegExp(`(["'])(?:\\\\[^]|${interp}|(?!\\1)[^\\r\\n\\\\])*\\1?`, "g"), STR, inside],
  [/\b0[xX][\da-fA-F_]+|(\b\d[\d_]*(\.\d[\d_]*)?|\.\d[\d_]*)([eE][+-]?\d+)?/g, NUM],
  [/\b(true|false|null)\b/g, BOOL],
  [/\b(bool|double|int|num)\b/g, TYPE],
  // `get`, `set`, `on`, `hide` … are contextual: after a dot they are members
  [
    /(?<!\.)\b((async|sync|yield)\*|(abstract|as|assert|async|await|base|break|case|catch|class|const|continue|covariant|deferred|default|do|dynamic|else|enum|export|extends|extension|external|factory|final|finally|for|get|hide|if|implements|import|in|interface|is|late|library|mixin|new|on|operator|part|required|rethrow|return|sealed|set|show|static|super|switch|sync|this|throw|try|typedef|var|void|when|while|with|yield)\b)/g,
    KWD,
  ],
  // annotations: `@override`, `@Deprecated('…')`
  [/@\w+/g, VAR],
  [/[/*+:?&|%^~=!,<>.^-]+/g, OPER],
  [/[a-zA-Z_$][\w$]*(?=\s*\()/g, FUNC],
  [/\b_?[A-Z][\w$]*\b/g, CLASS],
] as ShjLanguageDefinition;
