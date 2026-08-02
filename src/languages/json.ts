import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, NUM, VAR } from "../tokens.ts";
import { num, str } from "../common.ts";
export default [
  [/(("|')((?!\2)[^\r\n\\]|\\[^])*\2|[a-zA-Z]\w*)(?=\s*:)/g, VAR],
  str,
  num,
  [/\bnull\b/g, NUM],
  [/\b(true|false)\b/g, BOOL],
] as ShjLanguageDefinition;
