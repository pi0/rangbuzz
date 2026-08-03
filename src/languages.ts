/**
 * @module languages
 * (Static registry of every bundled language)
 *
 * This is the `./languages` entry too: every grammar is a named export of its
 * own, under the exact name the registry keys it by, so a `rangi/core` call
 * can be handed `{ js, ts }` and bundle nothing else.
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
import jsTemplateLiteralsRules, {
  type as jsTemplateLiteralsType,
} from "./languages/js_template_literals.ts";
import jsdocRules, { type as jsdocType } from "./languages/jsdoc.ts";
import json from "./languages/json.ts";
import jsx from "./languages/jsx.ts";
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
import regexRules, { type as regexType } from "./languages/regex.ts";
import rs from "./languages/rs.ts";
import scss from "./languages/scss.ts";
import sql from "./languages/sql.ts";
import svelte from "./languages/svelte.ts";
import swift from "./languages/swift.ts";
import todoRules, { type as todoType } from "./languages/todo.ts";
import toml from "./languages/toml.ts";
import ts from "./languages/ts.ts";
import tsx from "./languages/tsx.ts";
import uri from "./languages/uri.ts";
import vue from "./languages/vue.ts";
import xml from "./languages/xml.ts";
import yaml from "./languages/yaml.ts";

/**
 * The grammars that carry a `type` — the token type applied to whatever their
 * own rules leave unmatched — are the module shaped half of
 * {@link ShjLanguageModule}, and are exported already assembled so that they
 * drop into a registry like any other one.
 */
export const js_template_literals = {
    default: jsTemplateLiteralsRules,
    type: jsTemplateLiteralsType,
  },
  /** @see {@link js_template_literals} */
  jsdoc = { default: jsdocRules, type: jsdocType },
  /** @see {@link js_template_literals} */
  regex = { default: regexRules, type: regexType },
  /** @see {@link js_template_literals} */
  todo = { default: todoRules, type: todoType };

export {
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
  json,
  jsx,
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
  rs,
  scss,
  sql,
  svelte,
  swift,
  toml,
  ts,
  tsx,
  uri,
  vue,
  xml,
  yaml,
};

/** Every alias of {@link aliases}, exported under its own name as well */
export {
  bash as sh,
  bash as shell,
  bash as zsh,
  c as h,
  cpp as cc,
  cpp as cxx,
  cpp as hpp,
  cs as csharp,
  diff as patch,
  docker as dockerfile,
  go as golang,
  graphql as gql,
  html as htm,
  js as cjs,
  js as javascript,
  js as mjs,
  json as json5,
  json as jsonc,
  json as jsonl,
  json as ndjson,
  kt as kotlin,
  kt as kts,
  make as makefile,
  make as mk,
  md as markdown,
  pl as perl,
  plain as text,
  plain as txt,
  ps1 as powershell,
  ps1 as pwsh,
  py as python,
  rb as ruby,
  rs as rust,
  ts as cts,
  ts as mts,
  ts as typescript,
  uri as url,
  xml as svg,
  yaml as yml,
};

/**
 * The alternative names a bundled language answers to, keyed by the name it is
 * looked up under and holding the very grammar it stands for.
 *
 * They are spread into {@link languages}, so an alias is accepted anywhere a
 * language name is — the `lang` option, the `sub` of a grammar — and is a named
 * export of this entry like any other language: `yml` is the `yaml` grammar
 * itself, not a copy of it.
 *
 * Kept as a registry of its own so that the canonical name of a language stays
 * knowable: {@link ShjLanguage} is the languages, {@link ShjLanguageAlias} the
 * other names they may be asked for.
 */
export const aliases = {
  cc: cpp,
  cjs: js,
  csharp: cs,
  cts: ts,
  cxx: cpp,
  dockerfile: docker,
  golang: go,
  gql: graphql,
  h: c,
  hpp: cpp,
  htm: html,
  javascript: js,
  json5: json,
  jsonc: json,
  jsonl: json,
  kotlin: kt,
  kts: kt,
  makefile: make,
  markdown: md,
  mjs: js,
  mk: make,
  mts: ts,
  ndjson: json,
  patch: diff,
  perl: pl,
  powershell: ps1,
  pwsh: ps1,
  python: py,
  ruby: rb,
  rust: rs,
  sh: bash,
  shell: bash,
  svg: xml,
  text: plain,
  txt: plain,
  typescript: ts,
  url: uri,
  yml: yaml,
  zsh: bash,
} satisfies ShjLanguages;

/**
 * Every bundled language definition, keyed by language name.
 *
 * A language is its bare definition, the same shape a custom language passed as
 * the `languages` option may take. The few that also carry a `type` — the token
 * type applied to whatever their own rules leave unmatched — are given in
 * module shape instead, the other half of {@link ShjLanguageModule}.
 *
 * The {@link aliases} are in here too, under the alternative names they stand
 * for, so a lookup is a plain property read whichever name the caller used.
 *
 * This is what the main entry hands the engine, so importing it pulls every
 * grammar in — which is the whole point of that entry, and the opposite of what
 * `rangi/core` is for: there, import the ones you want by name.
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
  js_template_literals,
  jsdoc,
  json,
  jsx,
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
  regex,
  rs,
  scss,
  sql,
  svelte,
  swift,
  todo,
  toml,
  ts,
  tsx,
  uri,
  vue,
  xml,
  yaml,
  ...aliases,
} satisfies ShjLanguages;

/**
 * An alternative name a bundled language also answers to, derived from
 * {@link aliases}
 */
export type ShjLanguageAlias = keyof typeof aliases;

/**
 * Name of a bundled language, derived from {@link languages}.
 *
 * The fragment grammars are left out: they are reached only through the `sub`
 * of another language, never passed as the `lang` option. `js_template_literals`
 * belongs to `js`; `todo` is what marks `TODO`/`FIXME` up inside the comments of
 * every other grammar, which is the only place it is meant to be used.
 *
 * The aliases are left out too: they are names of the same languages, listed by
 * {@link ShjLanguageAlias}, and this is the one name per language — what a map
 * keyed by language is keyed by.
 */
export type ShjLanguage = Exclude<
  keyof typeof languages,
  "js_template_literals" | "todo" | ShjLanguageAlias
>;
