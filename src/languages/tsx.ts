import type { ShjLanguageDefinition } from "../types.ts";
import { jsxElement } from "./jsx.ts";
import ts from "./ts.ts";

export default [/* @__PURE__ */ jsxElement("tsx"), ...ts] as ShjLanguageDefinition;
