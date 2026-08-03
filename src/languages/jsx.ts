import type { ShjLanguageComponent, ShjLanguageDefinition } from "../types.ts";
import { CLASS, OPER, STR, VAR } from "../tokens.ts";
import js from "./js.ts";
import { brace } from "./vue.ts";
import { name } from "./xml.ts";

const attrName = `[$\\w{}.:-]+`;
const quoted = `"[^"]*"?|'[^']*'?`;
const properties = `(?:\\s+${attrName}(?:\\s*=\\s*(?:${brace}|${quoted}|[^"'>\\s][^>\\s]*))?)*\\s*`;
const tag = `<${name}${properties}/?>|</(?:${name})?\\s*>|<>`;

export const jsxElement = (lang: string): ShjLanguageComponent => {
  const expr: ShjLanguageComponent = [RegExp(brace, "g"), OPER, [[/(?<=^\{)[^]+(?=\}$)/g, , lang]]],
    single: ShjLanguageComponent = [
      RegExp(tag, "g"),
      ,
      [
        [RegExp(`^</?(?:${name})?`, "g"), VAR, [[/^<\/?/g, OPER]]],
        // `attr={expr}`: unlike a quoted value this is code, not a string
        [RegExp(`=${brace}`, "g"), OPER, [[/(?<=^=\{)[^]+(?=\}$)/g, , lang]]],
        // `{...rest}`
        expr,
        [RegExp(`=\\s*(?:${quoted}|[^"'>\\s][^>\\s]*)`, "g"), STR, [[/^=/g, OPER]]],
        [/\/?>/g, OPER],
        [RegExp(name, "g"), CLASS],
      ],
    ];

  return [
    RegExp(
      `(?<![$\\w])<(${name})${properties}>[^]*?</\\1\\s*>|<>[^]*?</>|(?<![$\\w])<${name}${properties}/?>|</(?:${name})?\\s*>`,
      "g",
    ),
    ,
    [single, expr, [/&(#x?)?[\da-z]{1,8};/gi, VAR]],
  ];
};

export default [/* @__PURE__ */ jsxElement("jsx"), ...js] as ShjLanguageDefinition;
