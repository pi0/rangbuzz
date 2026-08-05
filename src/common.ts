/**
 * Commonly used match patterns
 *
 * They are imported and dropped into a grammar as is, so every language that
 * wants one shares the very rule tuple rather than a copy of it.
 */

import type { ShjLanguageComponent } from "./types.ts";
import { BRACKET, NUM, STR } from "./tokens.ts";

export const num: ShjLanguageComponent = [/(\.e?|\b)\d(e-|[\d.oxa-fA-F_])*(\.|\b)/g, NUM],
  str: ShjLanguageComponent = [/(["'])(\\[^]|(?!\1)[^\r\n\\])*\1?/g, STR],
  strDouble: ShjLanguageComponent = [/"((?!")[^\r\n\\]|\\[^])*"?/g, STR],
  bracket: ShjLanguageComponent = [/[{}[\]()]/g, BRACKET];
