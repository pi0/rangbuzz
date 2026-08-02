import type { ShjLanguageDefinition } from "../types.ts";
import { CLASS, CMNT, FUNC, KWD, OPER, STR, VAR } from "../tokens.ts";
import { detectLanguage } from "../detect.ts";

const definition: ShjLanguageDefinition = [
  [/^>.*|(=|-)\1+/gm, CMNT],
  [/\*\*.*?\*\*/g, CLASS],
  [
    /^(`{3,})(.*)\n[^]*?^\1[ \t]*$/gm,
    ,
    (code: string) => [
      ,
      KWD,
      [[/\n[^]*(?=```)/g, , code.split("\n")[0]!.slice(3) || detectLanguage(code)]],
    ],
  ],
  [/`[^`]*`/g, STR],
  [/~~.*?~~/g, VAR],
  [/\b_\S([^\n]*?\S)?_\b|\*\S([^\n]*?\S)?\*/g, KWD],
  [/^\s*(\*|\d+\.)\s/gm, KWD],
  [/\[[^\]]*]\([^)]*\)|<[^>]*>/g, FUNC, [[/^\[[^\]]*]/g, OPER]]],
];

export default definition;
