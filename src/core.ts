/**
 * @module core
 * (The entry that bundles nothing)
 *
 * The same functions as the main entry, minus what it pulls in for you: no
 * grammar and no theme ends up in your bundle unless you import it yourself
 * and pass it along, which is what makes the `languages` and `theme` options
 * required here.
 */

export { codeToHtml, highlightText, tokenize } from "./highlight.ts";
export { detectLanguage } from "./detect.ts";
export { codeToAnsi, printHighlight } from "./terminal.ts";
export type * from "./types.ts";
