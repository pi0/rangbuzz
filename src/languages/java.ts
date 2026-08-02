import type { ShjLanguageDefinition } from "../types.ts";
import { CLASS, FUNC, KWD, OPER } from "../tokens.ts";
import { num, str } from "../common.ts";
export default [
  [/\/\/.*\n?|\/\*((?!\*\/)[^])*(\*\/)?/g, , "todo"],
  str,
  num,
  [
    /\b(abstract|assert|boolean|break|byte|case|catch|char|class|continue|const|default|do|double|else|enum|exports|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|module|native|new|package|private|protected|public|requires|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|var|void|volatile|while)\b/g,
    KWD,
  ],
  [/[/*+:?&|%^~=!,<>.^-]+/g, OPER],
  [/[a-zA-Z_][\w_]*(?=\s*\()/g, FUNC],
  [/\b[A-Z][\w_]*\b/g, CLASS],
] as ShjLanguageDefinition;
