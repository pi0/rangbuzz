import type { ShjLanguageDefinition } from "../types.ts";
import { KWD, TYPE } from "../tokens.ts";
import js from "./js.ts";

export default [
  [/:\s*(any|void|number|boolean|string|object|never|enum)\b/g, TYPE],
  [
    /\b(type|namespace|typedef|interface|public|private|protected|implements|declare|abstract|readonly)\b/g,
    KWD,
  ],
  ...js,
] as ShjLanguageDefinition;
