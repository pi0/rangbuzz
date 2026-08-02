/**
 * @module languages
 * (Static registry of every bundled language)
 */

import type { ShjLanguages } from "./types.ts";

import asm from "./languages/asm.ts";
import bash from "./languages/bash.ts";
import bf from "./languages/bf.ts";
import c from "./languages/c.ts";
import css from "./languages/css.ts";
import csv from "./languages/csv.ts";
import diff from "./languages/diff.ts";
import docker from "./languages/docker.ts";
import git from "./languages/git.ts";
import go from "./languages/go.ts";
import html from "./languages/html.ts";
import http from "./languages/http.ts";
import ini from "./languages/ini.ts";
import java from "./languages/java.ts";
import js from "./languages/js.ts";
import jsTemplateLiterals, {
  type as jsTemplateLiteralsType,
} from "./languages/js_template_literals.ts";
import jsdoc, { type as jsdocType } from "./languages/jsdoc.ts";
import json from "./languages/json.ts";
import leanpubMd from "./languages/leanpub-md.ts";
import log from "./languages/log.ts";
import lua from "./languages/lua.ts";
import make from "./languages/make.ts";
import md from "./languages/md.ts";
import pl from "./languages/pl.ts";
import plain from "./languages/plain.ts";
import py from "./languages/py.ts";
import regex, { type as regexType } from "./languages/regex.ts";
import rs from "./languages/rs.ts";
import sql from "./languages/sql.ts";
import todo, { type as todoType } from "./languages/todo.ts";
import toml from "./languages/toml.ts";
import ts from "./languages/ts.ts";
import uri from "./languages/uri.ts";
import xml from "./languages/xml.ts";
import yaml from "./languages/yaml.ts";

/**
 * Every bundled language definition, keyed by language name.
 *
 * A language is its bare definition, the same shape a custom language passed as
 * the `languages` option may take. The few that also carry a `type` — the token
 * type applied to whatever their own rules leave unmatched — are given in
 * module shape instead, the other half of {@link ShjLanguageModule}.
 */
export const languages = {
  asm,
  bash,
  bf,
  c,
  css,
  csv,
  diff,
  docker,
  git,
  go,
  html,
  http,
  ini,
  java,
  js,
  js_template_literals: { default: jsTemplateLiterals, type: jsTemplateLiteralsType },
  jsdoc: { default: jsdoc, type: jsdocType },
  json,
  "leanpub-md": leanpubMd,
  log,
  lua,
  make,
  md,
  pl,
  plain,
  py,
  regex: { default: regex, type: regexType },
  rs,
  sql,
  todo: { default: todo, type: todoType },
  toml,
  ts,
  uri,
  xml,
  yaml,
} satisfies ShjLanguages;

/**
 * Name of a bundled language, derived from {@link languages}.
 *
 * `js_template_literals` is left out: it is a fragment grammar, reached only
 * through the rules of `js`, never passed as the `lang` option.
 */
export type ShjLanguage = Exclude<keyof typeof languages, "js_template_literals">;
