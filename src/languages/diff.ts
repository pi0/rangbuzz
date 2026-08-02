import type { ShjLanguageDefinition } from "../types.ts";
import { DELETED, INSERT, KWD, SECTION } from "../tokens.ts";
export default [
  [/^[-<].*/gm, DELETED],
  [/^[+>].*/gm, INSERT],
  [/!.*/gm, KWD],
  [/^@@.*@@$|^\d.*|^([*-+])\1\1.*/gm, SECTION],
] as ShjLanguageDefinition;
