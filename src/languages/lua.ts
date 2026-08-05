import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, FUNC, KWD, OPER } from "../tokens.ts";
import { bracket, num, str } from "../common.ts";

export default [
  // a long comment closes on `]]`, whether or not it is written `--]]`
  [/^#!.*|--(\[(=*)\[[^]*?\]\2\]|.*)/g, , "todo"],
  str,
  [
    /\b(and|break|do|else|elseif|end|for|function|if|in|local|not|or|repeat|return|then|until|while)\b/g,
    KWD,
  ],
  [/\b(true|false|nil)\b/g, BOOL],
  [/[+*/%^#=~<>:,.-]+/g, OPER],
  num,
  [/[a-z_]+(?=\s*[({])/g, FUNC],
  bracket,
] as ShjLanguageDefinition;
