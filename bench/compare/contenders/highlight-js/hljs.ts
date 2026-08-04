/**
 * Our language -> the grammar highlight.js knows it by, `null` where it has
 * none.
 *
 * `toml` is not a mistake: highlight.js highlights TOML with its INI grammar,
 * under an alias, and that is the grammar a user of it gets. `jsx` and `tsx`
 * are the same case: aliases of its `javascript` and `typescript`, whose
 * grammars carry what JSX handling it has.
 */

import type { ShjLanguage } from "../../../../src/types.ts";

export const HLJS: Record<ShjLanguage, string | null> = {
  asm: "x86asm",
  astro: null,
  bash: "bash",
  c: "c",
  cpp: "cpp",
  cs: "csharp",
  css: "css",
  csv: null,
  dart: "dart",
  diff: "diff",
  docker: "dockerfile",
  go: "go",
  graphql: "graphql",
  html: "xml",
  http: "http",
  ini: "ini",
  java: "java",
  js: "javascript",
  jsdoc: null,
  json: "json",
  jsx: "javascript",
  kt: "kotlin",
  less: "less",
  log: null,
  lua: "lua",
  make: "makefile",
  md: "markdown",
  php: "php",
  pl: "perl",
  plain: "plaintext",
  ps1: "powershell",
  py: "python",
  rb: "ruby",
  regex: null,
  rs: "rust",
  scss: "scss",
  sql: "sql",
  svelte: null,
  swift: "swift",
  toml: "ini",
  ts: "typescript",
  tsx: "typescript",
  uri: null,
  vue: null,
  xml: "xml",
  yaml: "yaml",
};
