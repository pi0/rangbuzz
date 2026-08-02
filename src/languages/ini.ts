import type { ShjLanguageDefinition } from "../types.ts";
import { OPER, SECTION, STR, VAR } from "../tokens.ts";
export default [
  [/(^[ \f\t\v]*)[#;].*/gm, , "todo"],
  [/.*(?==)/g, VAR],
  [/^\s*\[.+\]\s*$/gm, SECTION],
  [/=/g, OPER],
  [/.*/g, STR],
] as ShjLanguageDefinition;
