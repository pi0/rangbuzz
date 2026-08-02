import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, CMNT, ERR, NUM, OPER } from "../tokens.ts";
import { num, strDouble } from "../common.ts";
export default [
  [/^#.*/gm, CMNT],
  strDouble,
  num,
  [/\b(err(or)?|[a-z_-]*exception|warn|warning|failed|ko|invalid|not ?found|alert|fatal)\b/gi, ERR],
  [/\b(null|undefined)\b/gi, NUM],
  [/\b(false|true|yes|no)\b/gi, BOOL],
  [/\.|,/g, OPER],
] as ShjLanguageDefinition;
