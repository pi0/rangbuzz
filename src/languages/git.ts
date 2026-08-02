import type { ShjLanguageDefinition } from "../types.ts";
import diff from "./diff.ts";

export default [
  {
    match: /^#.*/gm,
    sub: "todo",
  },
  {
    expand: "str",
  },
  ...diff,
  {
    type: "func",
    match: /^(\$ )?git(\s.*)?$/gm,
  },
  {
    type: "kwd",
    match: /^commit \w+$/gm,
  },
] as ShjLanguageDefinition;
