import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, OPER, STR, TYPE, VAR } from "../tokens.ts";
import { num, str } from "../common.ts";
export default [
  [/#.*/g, , "todo"],
  str,
  [/(>|\|)\r?\n((\s[^\n]*)?(\r?\n|$))*/g, STR],
  [/!![a-z]+/g, TYPE],
  [/\b(Yes|No)\b/g, BOOL],
  [/[+:-]/g, OPER],
  num,
  [/[a-zA-Z][\w-]*(?=:)/g, VAR],
] as ShjLanguageDefinition;
