import type { ShjLanguageDefinition } from "../types.ts";
import xml, { properties, xmlElement } from "./xml.ts";

export default [
  {
    type: "class",
    match: /<!DOCTYPE("[^"]*"|'[^']*'|[^"'>])*>/gi,
    sub: [
      {
        type: "str",
        match: /"[^"]*"|'[^']*'/g,
      },
      {
        type: "oper",
        match: /^<!|>$/g,
      },
      {
        type: "var",
        match: /DOCTYPE/gi,
      },
    ],
  },
  {
    match: RegExp(`<style${properties}>[^]*?</style\\s*>`, "g"),
    sub: [
      {
        match: RegExp(`^<style${properties}>`, "g"),
        sub: xmlElement.sub,
      },
      {
        match: RegExp(`${xmlElement.match}|[^]*(?=</style\\s*>$)`, "g"),
        sub: "css",
      },
      xmlElement,
    ],
  },
  {
    match: RegExp(`<script${properties}>[^]*?</script\\s*>`, "g"),
    sub: [
      {
        match: RegExp(`^<script${properties}>`, "g"),
        sub: xmlElement.sub,
      },
      {
        match: RegExp(`${xmlElement.match}|[^]*(?=</script\\s*>$)`, "g"),
        sub: "js",
      },
      xmlElement,
    ],
  },
  ...xml,
] as ShjLanguageDefinition;
