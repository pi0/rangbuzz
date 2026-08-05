import type { ShjLanguageComponent, ShjLanguageDefinition } from "../types.ts";
import { BOOL, CLASS, CMNT, ESC, FUNC, KWD, NUM, OPER, STR, TYPE, VAR } from "../tokens.ts";
import { bracket } from "../common.ts";

let esc: ShjLanguageComponent = [/\\(x[\da-fA-F]{1,4}|u[\da-fA-F]{4}|U[\da-fA-F]{8}|[^])/g, ESC],
  // `{expr,align:format}` inside an interpolated string, highlighted as code
  hole: ShjLanguageComponent = [
    /\{[^{}"\r\n]*}/g,
    ,
    [
      [/^\{|}$/g, KWD],
      [/[^{}:]+/g, , "cs"],
      // the alignment belongs to the expression, the format to the text
      [/:[^{}]*/g, STR],
    ],
  ];

export default [
  // `///` xml doc comment: the tags are markup, the prose is not
  [
    /\/\/\/.*\n?/g,
    CMNT,
    [
      [/(?<=<\/?)[\w.-]+/g, VAR],
      [/"[^"\r\n]*"/g, STR],
    ],
  ],
  // line and block comments
  [/\/\/.*\n?|\/\*((?!\*\/)[^])*(\*\/)?/g, , "todo"],
  // raw string literal: nothing is escaped inside, `"` included
  [/\$*"""[^]*?"""/g, STR],
  // interpolated verbatim string: `""` is the only escape
  [/(\$@|@\$)"([^"]|"")*"?/g, STR, [hole]],
  // verbatim string: no escape but `""`, and it may span lines
  [/@"([^"]|"")*"?/g, STR],
  // interpolated string: the `$` belongs to the literal
  [/\$"((?!")[^\r\n\\]|\\[^])*"?/g, STR, [hole, esc]],
  // string and char literal
  [/(["'])(\\[^]|(?!\1)[^\r\n\\])*\1?/g, STR, [esc]],
  // hex, binary, digit separators, exponent and the `f`/`m`/`ul` suffixes
  [/\b0[xb][\da-f_]+[ul]*|(\b\d|\.\d)[\d_]*(\.\d[\d_]*)?(e[+-]?\d+)?[dflmu]*\b/gi, NUM],
  // preprocessor directive, the rest of the line being its argument
  [/^[ \t]*#[^\r\n]*/gm, , [[/#\s*\w+/g, KWD]]],
  // the name of an attribute: [Serializable], [Obsolete("x")], f([In] x)
  [/(?<=(^[ \t]*|[(,]\s*)\[\s*)@?[\w.]+/gm, TYPE],
  [/\b(true|false|null)\b/g, BOOL],
  [
    /\bfile(?=\s+(class|record|struct|interface|enum|delegate))|\b(abstract|add|alias|and|as|ascending|async|await|base|bool|break|by|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|descending|do|double|dynamic|else|enum|equals|event|explicit|extern|finally|fixed|float|for|foreach|from|get|global|goto|group|if|implicit|in|init|int|interface|internal|into|is|join|let|lock|long|nameof|namespace|new|nint|not|notnull|nuint|object|on|operator|or|orderby|out|override|params|partial|private|protected|public|readonly|record|ref|remove|required|return|sbyte|scoped|sealed|select|set|short|sizeof|stackalloc|static|string|struct|switch|this|throw|try|typeof|uint|ulong|unchecked|unmanaged|unsafe|ushort|using|value|var|virtual|void|volatile|when|where|while|with|yield)\b/g,
    KWD,
  ],
  [/[/*+:?&|%^~=!,<>.^-]+/g, OPER],
  // a call, a declaration, or either of them with explicit type arguments
  [/[a-zA-Z_]\w*(?=\s*(<[\w\s,.?[\]]*>\s*)?\()/g, FUNC],
  [/\b[A-Z]\w*\b/g, CLASS],
  bracket,
] as ShjLanguageDefinition;
