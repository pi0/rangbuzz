import type { ShjLanguageDefinition } from "../types.ts";
import { OPER } from "../tokens.ts";
import { component, expr } from "./vue.ts";

export default /* @__PURE__ */ component(
  // `client:load|idle|visible|media|only`, `server:defer`, `set:html|text`,
  // `is:inline|raw|global`, `define:vars`, `transition:name`
  `[\\w-]+:[\\w-]*`,
  [
    // The `---` fence, whose body is TypeScript. It is frontmatter only at the
    // very top of the file, which is what anchoring the pattern buys: `^` with
    // no `m` flag matches at offset 0 and nowhere else.
    [/^---\n[^]*?\n---/g, OPER, [[/(?<=^---\n)[^]+(?=\n---$)/g, , "ts"]]],
    // `{expr}`, and with it the JSX comment `{/* … */}`, which `js` finds
    expr,
  ],
) as ShjLanguageDefinition;
