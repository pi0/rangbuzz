import type { ShjLanguageDefinition } from "../types.ts";

let esc: { type: string; match: RegExp } = {
    type: "esc",
    match: /\\(x[\da-fA-F]{1,4}|u[\da-fA-F]{4}|U[\da-fA-F]{8}|[^])/g,
  },
  // `{expr,align:format}` inside an interpolated string, highlighted as code
  hole: { match: RegExp; sub: ShjLanguageDefinition } = {
    match: /\{[^{}"\r\n]*}/g,
    sub: [
      { type: "kwd", match: /^\{|}$/g },
      { match: /[^{}:]+/g, sub: "cs" },
      // the alignment belongs to the expression, the format to the text
      { type: "str", match: /:[^{}]*/g },
    ],
  };

export default [
  {
    // `///` xml doc comment: the tags are markup, the prose is not
    type: "cmnt",
    match: /\/\/\/.*\n?/g,
    sub: [
      {
        type: "var",
        match: /(?<=<\/?)[\w.-]+/g,
      },
      {
        type: "str",
        match: /"[^"\r\n]*"/g,
      },
    ],
  },
  {
    // line and block comments
    match: /\/\/.*\n?|\/\*((?!\*\/)[^])*(\*\/)?/g,
    sub: "todo",
  },
  {
    // raw string literal: nothing is escaped inside, `"` included
    type: "str",
    match: /\$*"""[^]*?"""/g,
  },
  {
    // interpolated verbatim string: `""` is the only escape
    type: "str",
    match: /(\$@|@\$)"([^"]|"")*"?/g,
    sub: [hole],
  },
  {
    // verbatim string: no escape but `""`, and it may span lines
    type: "str",
    match: /@"([^"]|"")*"?/g,
  },
  {
    // interpolated string: the `$` belongs to the literal
    type: "str",
    match: /\$"((?!")[^\r\n\\]|\\[^])*"?/g,
    sub: [hole, esc],
  },
  {
    // string and char literal
    type: "str",
    match: /(["'])(\\[^]|(?!\1)[^\r\n\\])*\1?/g,
    sub: [esc],
  },
  {
    // hex, binary, digit separators, exponent and the `f`/`m`/`ul` suffixes
    type: "num",
    match: /\b0[xb][\da-f_]+[ul]*|(\b\d|\.\d)[\d_]*(\.\d[\d_]*)?(e[+-]?\d+)?[dflmu]*\b/gi,
  },
  {
    // preprocessor directive, the rest of the line being its argument
    match: /^[ \t]*#[^\r\n]*/gm,
    sub: [
      {
        type: "kwd",
        match: /#\s*\w+/g,
      },
    ],
  },
  {
    // the name of an attribute: [Serializable], [Obsolete("x")], f([In] x)
    type: "type",
    match: /(?<=(^[ \t]*|[(,]\s*)\[\s*)@?[\w.]+/gm,
  },
  {
    type: "bool",
    match: /\b(true|false|null)\b/g,
  },
  {
    type: "kwd",
    match:
      /\bfile(?=\s+(class|record|struct|interface|enum|delegate))|\b(abstract|add|alias|and|as|ascending|async|await|base|bool|break|by|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|descending|do|double|dynamic|else|enum|equals|event|explicit|extern|finally|fixed|float|for|foreach|from|get|global|goto|group|if|implicit|in|init|int|interface|internal|into|is|join|let|lock|long|nameof|namespace|new|nint|not|notnull|nuint|object|on|operator|or|orderby|out|override|params|partial|private|protected|public|readonly|record|ref|remove|required|return|sbyte|scoped|sealed|select|set|short|sizeof|stackalloc|static|string|struct|switch|this|throw|try|typeof|uint|ulong|unchecked|unmanaged|unsafe|ushort|using|value|var|virtual|void|volatile|when|where|while|with|yield)\b/g,
  },
  {
    type: "oper",
    match: /[/*+:?&|%^~=!,<>.^-]+/g,
  },
  {
    // a call, a declaration, or either of them with explicit type arguments
    type: "func",
    match: /[a-zA-Z_]\w*(?=\s*(<[\w\s,.?[\]]*>\s*)?\()/g,
  },
  {
    type: "class",
    match: /\b[A-Z]\w*\b/g,
  },
] as ShjLanguageDefinition;
