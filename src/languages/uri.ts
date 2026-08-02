import type { ShjLanguageDefinition } from "../types.ts";
import { CLASS, FUNC, NUM, OPER, VAR } from "../tokens.ts";
export default [
  [/^#.*/gm, , "todo"],
  [/^\w+(?=:)/gm, CLASS],
  [/:\d+/g, NUM],
  [/[:/&?]|\w+=/g, OPER],
  [/[.\w]+@|#[\w]+$/gm, FUNC],
  [/\w+\.\w+(\.\w+)*/g, VAR],
] as ShjLanguageDefinition;
