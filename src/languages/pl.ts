import type { ShjLanguageDefinition } from "../types.ts";
import { FUNC, KWD, OPER, STR } from "../tokens.ts";
import { num } from "../common.ts";
export default [
  [/#.*/g, , "todo"],
  [/(["'])(\\[^]|(?!\1)[^])*\1?/g, STR],
  num,
  [
    /\b(any|break|continue|default|delete|die|do|else|elsif|eval|for|foreach|given|goto|if|last|local|my|next|our|package|print|redo|require|return|say|state|sub|switch|undef|unless|until|use|when|while|not|and|or|xor)\b/g,
    KWD,
  ],
  [/[-+*/%~!&<>|=?,]+/g, OPER],
  [/[a-z_]+(?=\s*\()/g, FUNC],
] as ShjLanguageDefinition;
