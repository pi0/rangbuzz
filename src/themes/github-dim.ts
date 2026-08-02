import type { ShjTheme } from "../types.ts";

import githubDark from "./github-dark.ts";

const theme: ShjTheme = {
  ...githubDark,
  name: "github-dim",
  bg: "#22272e",
};

export default theme;
