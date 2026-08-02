import type { ShjLanguageDefinition } from "../types.ts";
import { KWD, OPER, SECTION, VAR } from "../tokens.ts";
import { num, str } from "../common.ts";
import { detectLanguage } from "../detect.ts";

const definition: ShjLanguageDefinition = [
  [/^(GET|HEAD|POST|PUT|DELETE|CONNECT|OPTIONS|TRACE|PATCH|PRI|SEARCH)\b/gm, KWD],
  str,
  [/\bHTTP\/[\d.]+\b/g, SECTION],
  num,
  [/[,;:=]/g, OPER],
  [/[a-zA-Z][\w-]*(?=:)/g, VAR],
  [/\n\n[^]*/g, , detectLanguage],
];

export default definition;
