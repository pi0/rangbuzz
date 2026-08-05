import type { ShjTheme } from "../types.ts";

// No color of its own: every slot defers to a custom property, so one
// stylesheet rethemes every block on the page. `scheme` is left out on
// purpose — the page owns `color-scheme` here.
const theme: ShjTheme = {
  name: "css-variables",
  bg: "var(--shj-bg)",
  fg: "var(--shj-fg)",
  numbers: "var(--shj-numbers,var(--shj-cmnt))",
  tokens: {
    deleted: "var(--shj-deleted)",
    err: "var(--shj-err)",
    var: "var(--shj-var)",
    section: "var(--shj-section)",
    kwd: "var(--shj-kwd)",
    class: "var(--shj-class)",
    cmnt: "var(--shj-cmnt)",
    insert: "var(--shj-insert)",
    type: "var(--shj-type)",
    func: "var(--shj-func)",
    bool: "var(--shj-bool)",
    num: "var(--shj-num)",
    oper: "var(--shj-oper)",
    str: "var(--shj-str)",
    esc: "var(--shj-esc)",
    bracket: "var(--shj-bracket)",
  },
};

export default theme;
