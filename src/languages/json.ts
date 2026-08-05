import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, NUM, VAR } from "../tokens.ts";
import { bracket, num, str } from "../common.ts";

export default [
  // jsonc/json5 comments: json proper has none, but the dialects that do are
  // aliases of this grammar, and a comment in a strict `.json` is a mistake
  // worth seeing as a comment rather than as a broken key
  [/\/\/.*\n?|\/\*((?!\*\/)[^])*(\*\/)?/g, , "todo"],
  [/(("|')((?!\2)[^\r\n\\]|\\[^])*\2|[a-zA-Z]\w*)(?=\s*:)/g, VAR],
  str,
  num,
  // `NaN` and `Infinity` are json5's, and nothing else spells them
  [/\b(null|NaN|Infinity)\b/g, NUM],
  [/\b(true|false)\b/g, BOOL],
  bracket,
] as ShjLanguageDefinition;
