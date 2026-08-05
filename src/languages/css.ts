import type { ShjLanguageDefinition } from "../types.ts";
import { FUNC, KWD, NUM, STR, VAR } from "../tokens.ts";
import { bracket, str } from "../common.ts";

export default [
  [/\/\*((?!\*\/)[^])*(\*\/)?/g, , "todo"],
  str,
  [/@\w+\b|\b(and|not|only|or)\b|\b(?=([a-z-]+))\2(?=[^{}]*{)/g, KWD],
  [/\b[\w-]+(?=\s*:)|(::?|\.)[\w-]+(?=[^{}]*{)/g, VAR],
  [/#[\w-]+(?=[^{}]*{)/g, FUNC],
  [/#[\da-f]{3,8}/g, NUM],
  [/\d+(\.\d+)?(cm|mm|in|px|pt|pc|em|ex|ch|rem|vm|vh|vmin|vmax|%)?/g, NUM, [[/[a-z]+|%/g, VAR]]],
  [
    /url\([^)]*\)/g,
    ,
    [
      [/url(?=\()/g, FUNC],
      [/[^()]+/g, STR],
    ],
  ],
  [/\b[a-zA-Z]\w*(?=\s*\()/g, FUNC],
  [/\b[a-z-]+\b/g, NUM],
  bracket,
] as ShjLanguageDefinition;
