import type { ShjLanguageDefinition } from "../types.ts";
import { CMNT, FUNC, KWD, NUM, OPER } from "../tokens.ts";
import { num, str } from "../common.ts";
export default [
  [/(;|#).*/gm, CMNT],
  str,
  num,
  // value (ex: "$0x1")
  [/\$[\da-fA-F]*\b/g, NUM],
  // ex: "section .data"
  [
    /^[a-z]+\s+[a-z.]+\b/gm,
    KWD,
    [
      // keyword (ex: "section")
      [/^[a-z]+/g, FUNC],
    ],
  ],
  // instruction (ex: "mov")
  [/^[ \t]*[a-z][a-z\d]*\b/gm, KWD],
  [/%|\$/g, OPER],
] as ShjLanguageDefinition;
