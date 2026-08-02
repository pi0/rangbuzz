import type { ShjLanguageDefinition } from "../types.ts";
import { CLASS, CMNT, ERR, INSERT, OPER } from "../tokens.ts";
export default [
  [/\b(TODO|FIXME|DEBUG|OPTIMIZE|WARNING|XXX|BUG)\b/g, ERR],
  [/\bIDEA\b/g, CLASS],
  [/\b(CHANGED|FIX|CHANGE)\b/g, INSERT],
  [/\bQUESTION\b/g, OPER],
] as ShjLanguageDefinition;
export let type = CMNT;
