import type { ShjLanguageDefinition } from "../types.ts";
import { OPER } from "../tokens.ts";
import { strDouble } from "../common.ts";
export default [strDouble, [/,/g, OPER]] as ShjLanguageDefinition;
