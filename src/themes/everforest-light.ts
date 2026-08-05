import type { ShjTheme } from "../types.ts";

// Everforest Light Medium, as mapped by sainnhe/everforest-vscode
const theme: ShjTheme = {
  name: "everforest-light",
  scheme: "light",
  bg: "#fdf6e3",
  fg: "#5c6a72",
  numbers: "#939f91",
  tokens: {
    // red, which the theme also gives the first heading and an ini section title
    kwd: "#f85552",
    section: "#f85552",
    err: "#f85552",
    deleted: "#f85552",
    // orange, `keyword.operator` and the modifiers
    oper: "#f57d26",
    str: "#dfa000",
    // green, shared by the functions and an inserted diff line
    func: "#8da101",
    insert: "#8da101",
    // aqua, the color of a css property and of a member everywhere it names one
    var: "#35a77c",
    // blue, `storage.type` and every class
    class: "#3a94c5",
    type: "#3a94c5",
    num: "#df69ba",
    bool: "#df69ba",
    // grey1, the comments
    cmnt: "#939f91",
    // the punctuation is left at the foreground color
    bracket: "#5c6a72",
  },
};

export default theme;
