import type { ShjLanguageDefinition } from "../types.ts";
import { KWD, NUM, OPER, VAR } from "../tokens.ts";
export default [
  [/^(?!\/).*/gm, , "todo"],
  [/\[((?!\])[^\\]|\\.)*\]/g, NUM],
  [/\||\^|\$|\\.|\w+($|\r|\n)/g, KWD],
  [/\*|\+|\{\d+,\d+\}/g, VAR],
] as ShjLanguageDefinition;
export let type = OPER;
