import type { ShjTheme } from "../types.ts";

// Everforest Dark Medium, as mapped by sainnhe/everforest-vscode
const theme: ShjTheme = {
  name: "everforest-dark",
  scheme: "dark",
  bg: "#2d353b",
  fg: "#d3c6aa",
  numbers: "#859289",
  tokens: {
    // red, which the theme also gives the first heading and an ini section title
    kwd: "#e67e80",
    section: "#e67e80",
    err: "#e67e80",
    deleted: "#e67e80",
    // orange, `keyword.operator` and the modifiers
    oper: "#e69875",
    str: "#dbbc7f",
    // green, shared by the functions and an inserted diff line
    func: "#a7c080",
    insert: "#a7c080",
    // aqua, the color of a css property and of a member everywhere it names one
    var: "#83c092",
    // blue, `storage.type` and every class
    class: "#7fbbb3",
    type: "#7fbbb3",
    num: "#d699b6",
    bool: "#d699b6",
    // grey1, the comments
    cmnt: "#859289",
    // the punctuation is left at the foreground color
    bracket: "#d3c6aa",
  },
};

export default theme;
