import type { ShjLanguageDefinition } from "../types.ts";
export default [
  {
    match: /^(?!\/).*/gm,
    sub: "todo",
  },
  {
    type: "num",
    match: /\[((?!\])[^\\]|\\.)*\]/g,
  },
  {
    type: "kwd",
    match: /\||\^|\$|\\.|\w+($|\r|\n)/g,
  },
  {
    type: "var",
    match: /\*|\+|\{\d+,\d+\}/g,
  },
] as ShjLanguageDefinition;
export let type = "oper";
