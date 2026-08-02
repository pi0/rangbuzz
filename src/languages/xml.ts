import type { ShjLanguageComponent, ShjLanguageDefinition } from "../types.ts";
import { CLASS, OPER, STR, VAR } from "../tokens.ts";

let nameStartChar =
    ":A-Z_a-z\u{C0}-\u{D6}\u{D8}-\u{F6}\u{F8}-\u{2FF}\u{370}-\u{37D}\u{37F}-\u{1FFF}\u{200C}-\u{200D}\u{2070}-\u{218F}\u{2C00}-\u{2FEF}\u{3001}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFFD}",
  nameChar = nameStartChar + "\\-\\.0-9\u{B7}\u{0300}-\u{036F}\u{203F}-\u{2040}";
export let name: string = `[${nameStartChar}][${nameChar}]*`,
  properties: string = `(\\s+${name}\\s*(=\\s*([^"'>\\s][^>\\s]*|("|')(\\\\[^]|(?!\\4)[^])*\\4?)?)?)*\\s*`,
  xmlElement: ShjLanguageComponent = [
    RegExp(`<[/!?]?${name}${properties}[/!?]?>`, "g"),
    ,
    [
      [RegExp(`^<[/!?]?${name}`, "g"), VAR, [[/^<[/!?]?/g, OPER]]],
      [/=\s*([^"'>\s][^>\s]*|("|')(\\[^]|(?!\2)[^])*\2?)/g, STR, [[/^=/g, OPER]]],
      [/[/!?]?>/g, OPER],
      [RegExp(name, "g"), CLASS],
    ],
  ];

export default [
  [/<!--[^]*?-->/g, , "todo"],
  [/<!\[CDATA\[[\s\S]*?\]\]>/gi, CLASS],
  xmlElement,
  // https://github.com/speed-highlight/core/issues/49
  [
    RegExp(`<\\?${name}([^?]|\\?[^?>])*\\?+>`, "g"),
    STR,
    [
      [RegExp(`^<\\?${name}`, "g"), VAR, [[/^<\?/g, OPER]]],
      [/\?+>$/g, OPER],
    ],
  ],
  [/&(#x?)?[\da-z]{1,8};/gi, VAR],
] as ShjLanguageDefinition;
