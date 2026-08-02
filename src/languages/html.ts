import type { ShjLanguageDefinition } from "../types.ts";
import { CLASS, OPER, STR, VAR } from "../tokens.ts";
import xml, { properties, xmlElement } from "./xml.ts";

export default [
  [
    /<!DOCTYPE("[^"]*"|'[^']*'|[^"'>])*>/gi,
    CLASS,
    [
      [/"[^"]*"|'[^']*'/g, STR],
      [/^<!|>$/g, OPER],
      [/DOCTYPE/gi, VAR],
    ],
  ],
  [
    RegExp(`<style${properties}>[^]*?</style\\s*>`, "g"),
    ,
    [
      [RegExp(`^<style${properties}>`, "g"), , xmlElement[2]],
      [RegExp(`${xmlElement[0]}|[^]*(?=</style\\s*>$)`, "g"), , "css"],
      xmlElement,
    ],
  ],
  [
    RegExp(`<script${properties}>[^]*?</script\\s*>`, "g"),
    ,
    [
      [RegExp(`^<script${properties}>`, "g"), , xmlElement[2]],
      [RegExp(`${xmlElement[0]}|[^]*(?=</script\\s*>$)`, "g"), , "js"],
      xmlElement,
    ],
  ],
  ...xml,
] as ShjLanguageDefinition;
