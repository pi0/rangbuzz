import type { ShjLanguageDefinition } from "../types.ts";
import { detectLanguage } from "../detect.ts";

export default [
  {
    type: "kwd",
    match: /^(GET|HEAD|POST|PUT|DELETE|CONNECT|OPTIONS|TRACE|PATCH|PRI|SEARCH)\b/gm,
  },
  {
    expand: "str",
  },
  {
    type: "section",
    match: /\bHTTP\/[\d.]+\b/g,
  },
  {
    expand: "num",
  },
  {
    type: "oper",
    match: /[,;:=]/g,
  },
  {
    type: "var",
    match: /[a-zA-Z][\w-]*(?=:)/g,
  },
  {
    match: /\n\n[^]*/g,
    sub: detectLanguage,
  },
] as ShjLanguageDefinition;
