import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, CLASS, FUNC, KWD, OPER, STR, VAR } from "../tokens.ts";
import { num, str } from "../common.ts";
export default [
  [/#.*/g, , "todo"],
  [
    /f("""|''')(\\[^]|(?!\1)[^])*\1?|f("|')(\\[^]|(?!\3).)*\3?/gi,
    STR,
    [[/{[^{}]*}/g, VAR, [[/(?!^{)[^]*(?=}$)/g, , "py"]]]],
  ],
  [/("""|''')(\\[^]|(?!\1)[^])*\1?/g, , "todo"],
  str,
  [
    /\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/g,
    KWD,
  ],
  [/\b(False|True|None)\b/g, BOOL],
  num,
  [/[a-z_]\w*(?=\s*\()/gi, FUNC],
  [/[-/*+<>,=!&|^%]+/g, OPER],
  [/\b[A-Z][\w_]*\b/g, CLASS],
] as ShjLanguageDefinition;
