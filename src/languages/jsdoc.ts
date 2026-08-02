import type { ShjLanguageDefinition } from "../types.ts";
import { CLASS, CMNT, KWD, VAR } from "../tokens.ts";
import todo from "./todo.ts";

export default [
  [/@\w+/g, KWD],
  [/{[\w\s|<>,.@[\]]+}/g, CLASS],
  [/\[[\w\s="']+\]/g, VAR],
  ...todo,
] as ShjLanguageDefinition;
export let type = CMNT;
