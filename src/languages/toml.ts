import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, NUM, OPER, SECTION, STR, VAR } from "../tokens.ts";
import { bracket, num, str } from "../common.ts";

export default [
  [/#.*/g, , "todo"],
  [/("""|''')((?!\1)[^]|\\[^])*\1?/g, STR],
  str,
  [/^\[.+\]\s*$/gm, SECTION],
  [/\b(inf|nan)\b|\d[\d:ZT.-]*/g, NUM],
  num,
  [/\b(true|false)\b/g, BOOL],
  [/[+,.=-]/g, OPER],
  [/[\w-]+(?=\s*=)/g, VAR],
  bracket,
] as ShjLanguageDefinition;
