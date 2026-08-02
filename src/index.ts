/**
 * @module index
 */

export { codeToHtml, highlightText, tokenize } from "./highlight.ts";
export { detectLanguage } from "./detect.ts";
export { codeToAnsi, printHighlight } from "./terminal.ts";
// only the two bundled themes: import any other one from `rangbuzz/themes`
export { defaultThemes } from "./defaults.ts";
export type * from "./types.ts";
