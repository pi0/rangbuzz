/**
 * Our language -> the grammar Speed Highlight knows it by, `null` where it has
 * none.
 *
 * The one map that is mostly an identity, because these are the names this
 * library inherited: where a row is `null` the language is one the fork added,
 * and the handful of names that differ are not renames but grammars that were
 * written here from scratch. Nothing is aliased onto a near neighbour — its `c`
 * is not asked to stand in for C++ the way highlight.js's `ini` genuinely does
 * stand in for TOML — so a `null` means a user of it has no grammar, not that
 * one was hard to choose.
 *
 * Its `bf`, `git` and `leanpub-md` have no counterpart on our side, and its
 * `todo` and `js_template_literals` are fragments here as they are there, so
 * none of the five can appear in a map keyed by `ShjLanguage`.
 */

import type { ShjLanguage as SpeedLanguage } from "@speed-highlight/core";

import type { ShjLanguage } from "../../../../src/types.ts";

export const SPEED: Record<ShjLanguage, SpeedLanguage | null> = {
  asm: "asm",
  astro: null,
  bash: "bash",
  c: "c",
  cpp: null,
  cs: null,
  css: "css",
  csv: "csv",
  dart: null,
  diff: "diff",
  docker: "docker",
  go: "go",
  graphql: null,
  html: "html",
  http: "http",
  ini: "ini",
  java: "java",
  js: "js",
  jsdoc: "jsdoc",
  json: "json",
  jsx: null,
  kt: null,
  less: null,
  log: "log",
  lua: "lua",
  make: "make",
  md: "md",
  php: null,
  pl: "pl",
  plain: "plain",
  ps1: null,
  py: "py",
  rb: null,
  regex: "regex",
  rs: "rs",
  scss: null,
  sql: "sql",
  svelte: null,
  swift: null,
  toml: "toml",
  ts: "ts",
  tsx: null,
  uri: "uri",
  vue: null,
  xml: "xml",
  yaml: "yaml",
};
