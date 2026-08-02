import type { ShjLanguageDefinition } from "../types.ts";
export default [
  {
    match: /\/\/.*\n?|\/\*((?!\*\/)[^])*(\*\/)?/g,
    sub: "todo",
  },
  {
    // raw string, with as many hashes as it was opened with: r"…", br##"…"##
    type: "str",
    match: /b?r(#*)"[^]*?"\1/g,
  },
  {
    type: "str",
    match: /b?"((?!")[^\r\n\\]|\\[^])*"?/g,
  },
  {
    // a character literal, closed on the same line: `'a'` is one, `'a` is a
    // lifetime and must not open a string
    type: "str",
    match: /b?'(\\u\{[\da-fA-F]+\}|\\[^]|[^\\'])'/g,
  },
  {
    expand: "num",
  },
  {
    type: "kwd",
    match:
      /\b(as|break|const|continue|crate|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|true|type|unsafe|use|where|while|async|await|dyn|abstract|become|box|do|final|macro|override|priv|typeof|unsized|virtual|yield|try)\b/g,
  },
  {
    type: "oper",
    match: /[/*+:?&|%^~=!,<>.^-]+/g,
  },
  {
    type: "class",
    match: /\b[A-Z][\w_]*\b/g,
  },
  {
    type: "func",
    match: /[a-zA-Z_][\w_]*(?=\s*!?\s*\()/g,
  },
] as ShjLanguageDefinition;
