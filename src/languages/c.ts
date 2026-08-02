import type { ShjLanguageDefinition } from "../types.ts";
import { CLASS, FUNC, KWD, OPER, STR } from "../tokens.ts";
import { num, str } from "../common.ts";
export default [
  [/\/\/.*\n?|\/\*((?!\*\/)[^])*(\*\/)?/g, , "todo"],
  str,
  num,
  [/#\s*include (<.*>|".*")/g, KWD, [[/(<|").*/g, STR]]],
  [
    /asm\s*{[^}]*}/g,
    ,
    [
      [/^asm/g, KWD],
      //type: 'str',
      [/[^{}]*(?=}$)/g, , "asm"],
    ],
  ],
  [
    /\*|&|#[a-z]+\b|\b(asm|auto|double|int|struct|break|else|long|switch|case|enum|register|typedef|char|extern|return|union|const|float|short|unsigned|continue|for|signed|void|default|goto|sizeof|volatile|do|if|static|while)\b/g,
    KWD,
  ],
  [/[/*+:?&|%^~=!,<>.^-]+/g, OPER],
  [/[a-zA-Z_][\w_]*(?=\s*\()/g, FUNC],
  [/\b[A-Z][\w_]*\b/g, CLASS],
] as ShjLanguageDefinition;
