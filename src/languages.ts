/**
 * @module languages
 * (Static registry of every bundled language)
 */

import type { ShjLanguageDefinition } from "./types.ts";

import * as asm from "./languages/asm.ts";
import * as bash from "./languages/bash.ts";
import * as bf from "./languages/bf.ts";
import * as c from "./languages/c.ts";
import * as css from "./languages/css.ts";
import * as csv from "./languages/csv.ts";
import * as diff from "./languages/diff.ts";
import * as docker from "./languages/docker.ts";
import * as git from "./languages/git.ts";
import * as go from "./languages/go.ts";
import * as html from "./languages/html.ts";
import * as http from "./languages/http.ts";
import * as ini from "./languages/ini.ts";
import * as java from "./languages/java.ts";
import * as js from "./languages/js.ts";
import * as jsTemplateLiterals from "./languages/js_template_literals.ts";
import * as jsdoc from "./languages/jsdoc.ts";
import * as json from "./languages/json.ts";
import * as leanpubMd from "./languages/leanpub-md.ts";
import * as log from "./languages/log.ts";
import * as lua from "./languages/lua.ts";
import * as make from "./languages/make.ts";
import * as md from "./languages/md.ts";
import * as pl from "./languages/pl.ts";
import * as plain from "./languages/plain.ts";
import * as py from "./languages/py.ts";
import * as regex from "./languages/regex.ts";
import * as rs from "./languages/rs.ts";
import * as sql from "./languages/sql.ts";
import * as todo from "./languages/todo.ts";
import * as toml from "./languages/toml.ts";
import * as ts from "./languages/ts.ts";
import * as uri from "./languages/uri.ts";
import * as xml from "./languages/xml.ts";
import * as yaml from "./languages/yaml.ts";

/**
 * Every bundled language definition, keyed by language name.
 *
 * Kept in module shape so that the bundled entries and the ones registered
 * through `loadLanguage` are interchangeable. A language may also export a
 * `type`, the token type applied to whatever its own rules leave unmatched.
 */
export const languages: Record<string, { default: ShjLanguageDefinition; type?: string }> = {
  asm: asm,
  bash: bash,
  bf: bf,
  c: c,
  css: css,
  csv: csv,
  diff: diff,
  docker: docker,
  git: git,
  go: go,
  html: html,
  http: http,
  ini: ini,
  java: java,
  js: js,
  js_template_literals: jsTemplateLiterals,
  jsdoc: jsdoc,
  json: json,
  "leanpub-md": leanpubMd,
  log: log,
  lua: lua,
  make: make,
  md: md,
  pl: pl,
  plain: plain,
  py: py,
  regex: regex,
  rs: rs,
  sql: sql,
  todo: todo,
  toml: toml,
  ts: ts,
  uri: uri,
  xml: xml,
  yaml: yaml,
};
