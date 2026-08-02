import type { ShjLanguageDefinition } from "../types.ts";
import { CLASS, KWD, OPER, SECTION, VAR } from "../tokens.ts";
import { num, str } from "../common.ts";
export default [
  [/^\s*#.*/gm, , "todo"],
  str,
  [/[${}()]+/g, OPER],
  [/.PHONY:/gm, CLASS],
  [/^[\w.]+:/gm, SECTION],
  [/\b(ifneq|endif)\b/g, KWD],
  num,
  [/[A-Z_]+(?=\s*=)/g, VAR],
  [/^.*$/gm, , "bash"],
] as ShjLanguageDefinition;
