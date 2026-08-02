import type { ShjLanguageDefinition } from "../types.ts";
import { CLASS, FUNC, KWD, OPER, STR } from "../tokens.ts";
import { num } from "../common.ts";
export default [
  [/\/\/.*\n?|\/\*((?!\*\/)[^])*(\*\/)?/g, , "todo"],
  // raw string, with as many hashes as it was opened with: r"…", br##"…"##
  [/b?r(#*)"[^]*?"\1/g, STR],
  [/b?"((?!")[^\r\n\\]|\\[^])*"?/g, STR],
  // a character literal, closed on the same line: `'a'` is one, `'a` is a
  // lifetime and must not open a string
  [/b?'(\\u\{[\da-fA-F]+\}|\\[^]|[^\\'])'/g, STR],
  num,
  [
    /\b(as|break|const|continue|crate|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|true|type|unsafe|use|where|while|async|await|dyn|abstract|become|box|do|final|macro|override|priv|typeof|unsized|virtual|yield|try)\b/g,
    KWD,
  ],
  [/[/*+:?&|%^~=!,<>.^-]+/g, OPER],
  [/\b[A-Z][\w_]*\b/g, CLASS],
  [/[a-zA-Z_][\w_]*(?=\s*!?\s*\()/g, FUNC],
] as ShjLanguageDefinition;
