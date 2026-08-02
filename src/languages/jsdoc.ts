import type { ShjLanguageDefinition } from "../types.ts";
import todo from "./todo.ts";

export default [
  {
    type: "kwd",
    match: /@\w+/g,
  },
  {
    type: "class",
    match: /{[\w\s|<>,.@[\]]+}/g,
  },
  {
    type: "var",
    match: /\[[\w\s="']+\]/g,
  },
  ...todo,
] as ShjLanguageDefinition;
export let type = "cmnt";
