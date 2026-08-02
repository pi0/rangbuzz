import type { ShjLanguageDefinition } from "../types.ts";
import js from "./js.ts";

export default [
  {
    type: "type",
    match: /:\s*(any|void|number|boolean|string|object|never|enum)\b/g,
  },
  {
    type: "kwd",
    match:
      /\b(type|namespace|typedef|interface|public|private|protected|implements|declare|abstract|readonly)\b/g,
  },
  ...js,
] as ShjLanguageDefinition;
