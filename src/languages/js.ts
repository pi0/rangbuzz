import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, CLASS, FUNC, KWD, NUM, OPER } from "../tokens.ts";
import { num, str } from "../common.ts";
export default [
  // js object keys: left plain, so `{ a: 1 }` reads as a key and not a label.
  // The `{`/`,` lookbehind is what keeps it from claiming the first branch of
  // a ternary (`c ? "a" : "b"`) or the value of a `case "x":`, both of which
  // are also followed by a colon but are ordinary expressions.
  [/(?<=[{,]\s*)(("|')((?!\2)[^\r\n\\]|\\[^])*\2|[a-zA-Z]\w*)(?=\s*:)/g],
  // jsdoc comments
  [/\/\*\*((?!\*\/)[^])*(\*\/)?/g, , "jsdoc"],
  // comments
  [/\/\/.*\n?|\/\*((?!\*\/)[^])*(\*\/)?/g, , "todo"],
  str,
  [/`((?!`)[^]|\\[^])*`?/g, , "js_template_literals"],
  [
    /=>|\b(this|set|get|as|async|await|break|case|catch|class|const|constructor|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|if|implements|import|in|instanceof|interface|let|var|of|new|package|private|protected|public|return|static|super|switch|throw|throws|try|typeof|void|while|with|yield)\b/g,
    KWD,
  ],
  [/\/((?!\/)[^\r\n\\]|\\.)+\/[dgimsuy]*/g, , "regex"],
  num,
  [/\b(NaN|null|undefined|[A-Z][A-Z_]*)\b/g, NUM],
  [/\b(true|false)\b/g, BOOL],
  [/[/*+:?&|%^~=!,<>.^-]+/g, OPER],
  [/\b[A-Z][\w_]*\b/g, CLASS],
  [/[a-zA-Z$_][\w$_]*(?=\s*((\?\.)?\s*\(|=\s*(\(?[\w,{}[\])]+\)? =>|function\b)))/g, FUNC],
] as ShjLanguageDefinition;
