/**
 * @module languages
 * (Static registry of every bundled language)
 */

import type { ShjLanguages } from "./types.ts";

import asm from "./languages/asm.ts";
import astro from "./languages/astro.ts";
import bash from "./languages/bash.ts";
import c from "./languages/c.ts";
import cpp from "./languages/cpp.ts";
import cs from "./languages/cs.ts";
import css from "./languages/css.ts";
import csv from "./languages/csv.ts";
import dart from "./languages/dart.ts";
import diff from "./languages/diff.ts";
import docker from "./languages/docker.ts";
import go from "./languages/go.ts";
import graphql from "./languages/graphql.ts";
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
import kt from "./languages/kt.ts";
import less from "./languages/less.ts";
import log from "./languages/log.ts";
import lua from "./languages/lua.ts";
import make from "./languages/make.ts";
import md from "./languages/md.ts";
import php from "./languages/php.ts";
import pl from "./languages/pl.ts";
import plain from "./languages/plain.ts";
import ps1 from "./languages/ps1.ts";
import py from "./languages/py.ts";
import rb from "./languages/rb.ts";
import regex, { type as regexType } from "./languages/regex.ts";
import rs from "./languages/rs.ts";
import scss from "./languages/scss.ts";
import sql from "./languages/sql.ts";
import svelte from "./languages/svelte.ts";
import swift from "./languages/swift.ts";
import todo, { type as todoType } from "./languages/todo.ts";
import toml from "./languages/toml.ts";
import ts from "./languages/ts.ts";
import uri from "./languages/uri.ts";
import vue from "./languages/vue.ts";
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
  astro,
  bash,
  c,
  cpp,
  cs,
  css,
  csv,
  dart,
  diff,
  docker,
  go,
  graphql,
  html,
  http,
  ini,
  java,
  js,
  js_template_literals: { default: jsTemplateLiterals, type: jsTemplateLiteralsType },
  jsdoc: { default: jsdoc, type: jsdocType },
  json,
  kt,
  less,
  log,
  lua,
  make,
  md,
  php,
  pl,
  plain,
  ps1,
  py,
  rb,
  regex: { default: regex, type: regexType },
  rs,
  scss,
  sql,
  svelte,
  swift,
  todo: { default: todo, type: todoType },
  toml,
  ts,
  uri,
  vue,
  xml,
  yaml,
} satisfies ShjLanguages;

/**
 * Name of a bundled language, derived from {@link languages}.
 *
 * The fragment grammars are left out: they are reached only through the `sub`
 * of another language, never passed as the `lang` option. `js_template_literals`
 * belongs to `js`; `todo` is what marks `TODO`/`FIXME` up inside the comments of
 * every other grammar, which is the only place it is meant to be used.
 */
export type ShjLanguage = Exclude<keyof typeof languages, "js_template_literals" | "todo">;
