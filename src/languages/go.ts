import type { ShjLanguageDefinition } from "../types.ts";
import { CLASS, FUNC, KWD, OPER, STR } from "../tokens.ts";
import { num, str } from "../common.ts";
export default [
  [/\/\/.*\n?|\/\*((?!\*\/)[^])*(\*\/)?/g, , "todo"],
  str,
  // raw string literal, spanning as many lines as it likes
  [/`[^`]*`?/g, STR],
  num,
  [
    /\*|&|\b(break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/g,
    KWD,
  ],
  [/[a-zA-Z_][\w_]*(?=\s*\()/g, FUNC],
  [/\b[A-Z][\w_]*\b/g, CLASS],
  [/[+\-*/%&|^~=!<>.^-]+/g, OPER],
] as ShjLanguageDefinition;
