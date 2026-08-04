import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, OPER, STR, TYPE, VAR } from "../tokens.ts";
import { bracket, num, str } from "../common.ts";

export default [
  [/#.*/g, , "todo"],
  str,
  [
    /(?<=^( *)-([ \t]+)(?:\S[^\r\n]*:[ \t]+|[-?:][ \t]+)(?:[!&]\S+[ \t]+)*)[>|](?:[1-9][+-]?|[+-][1-9]?)?(?:[ \t]+#.*)?[ \t]*\r?\n(?:(?:\1 \2 +[^\r\n]*|[ \t]*)(?:\r?\n|$))*/gm,
    STR,
  ],
  [
    /(?<=^( *)(?:(?!-[ \t])\S[^\r\n]*:[ \t]+|[-?:][ \t]+)(?:[!&]\S+[ \t]+)*)[>|](?:[1-9][+-]?|[+-][1-9]?)?(?:[ \t]+#.*)?[ \t]*\r?\n(?:(?:\1 +[^\r\n]*|[ \t]*)(?:\r?\n|$))*/gm,
    STR,
  ],
  [/!![a-z]+/g, TYPE],
  [/\b(Yes|No)\b/g, BOOL],
  [/[+:-]/g, OPER],
  num,
  [/[a-zA-Z][\w-]*(?=:)/g, VAR],
  bracket,
] as ShjLanguageDefinition;
