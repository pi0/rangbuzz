/**
 * The independent highlighters the grammars are cross checked against.
 *
 * Neither judge shares a line of code or a grammar with this project: Prism
 * (through `refractor`, its ESM distribution) matches with hand written regex
 * grammars, Shiki matches with the TextMate grammars VS Code itself uses. Both
 * are dev dependencies, neither is shipped.
 *
 * Each judge classifies every *character* of a snippet into a coarse alphabet
 * the three highlighters can actually agree on — the token names themselves are
 * far too different to compare directly.
 */

import { refractor } from "refractor/core";
import { type BundledLanguage, getSingletonHighlighter } from "shiki";

import bash from "refractor/bash";
import c from "refractor/c";
import cpp from "refractor/cpp";
import csharp from "refractor/csharp";
import css from "refractor/css";
import csv from "refractor/csv";
import dart from "refractor/dart";
import diff from "refractor/diff";
import docker from "refractor/docker";
import go from "refractor/go";
import graphql from "refractor/graphql";
import http from "refractor/http";
import ini from "refractor/ini";
import java from "refractor/java";
import javascript from "refractor/javascript";
import jsdoc from "refractor/jsdoc";
import json from "refractor/json";
import kotlin from "refractor/kotlin";
import less from "refractor/less";
import log from "refractor/log";
import lua from "refractor/lua";
import makefile from "refractor/makefile";
import markdown from "refractor/markdown";
import markup from "refractor/markup";
import nasm from "refractor/nasm";
import perl from "refractor/perl";
import php from "refractor/php";
import powershell from "refractor/powershell";
import python from "refractor/python";
import regex from "refractor/regex";
import ruby from "refractor/ruby";
import rust from "refractor/rust";
import scss from "refractor/scss";
import sql from "refractor/sql";
import swift from "refractor/swift";
import toml from "refractor/toml";
import typescript from "refractor/typescript";
import uri from "refractor/uri";
import yaml from "refractor/yaml";

for (const lang of [
  bash,
  c,
  cpp,
  csharp,
  css,
  csv,
  dart,
  diff,
  docker,
  go,
  graphql,
  http,
  ini,
  java,
  javascript,
  jsdoc,
  json,
  kotlin,
  less,
  log,
  lua,
  makefile,
  markdown,
  markup,
  nasm,
  perl,
  php,
  powershell,
  python,
  regex,
  ruby,
  rust,
  scss,
  sql,
  swift,
  toml,
  typescript,
  uri,
  yaml,
])
  refractor.register(lang);

/**
 * The coarse alphabet the three highlighters are compared in.
 *
 * `cmnt` and `str` are structural — they are what a grammar has to get right,
 * and getting them wrong swallows the rest of the file. `num` and `kwd` are
 * compared too, but only reported, never asserted: which identifiers count as
 * keywords is a matter of taste no two highlighters share.
 */
export type Klass = "cmnt" | "str" | "num" | "kwd" | "other";

/** The classes a disagreement is worth failing over */
export const STRUCTURAL: Klass[] = ["cmnt", "str"];

/**
 * Which grammar each judge should be asked for.
 *
 * A missing entry means the judge has no counterpart for that language, so it
 * simply does not vote. The languages no judge covers at all are left to the
 * snapshot and the invariants: `plain` and `jsdoc` because they mark up the
 * inside of a comment, which the judges only ever see as one flat comment
 * (Prism has a `jsdoc` grammar, but it is a JavaScript dialect meant for the
 * code in an `@example`, not the annotation language); and the fragment
 * grammars `js_template_literals` and `todo`, which are reached only through
 * the `sub` of another language and so are graded wherever that language is.
 */
export const JUDGED: Record<string, { prism?: string; shiki?: BundledLanguage }> = {
  asm: { prism: "nasm", shiki: "asm" },
  // Prism has no Astro or Svelte grammar, so Shiki votes alone for both
  astro: { shiki: "astro" },
  bash: { prism: "bash", shiki: "shellscript" },
  c: { prism: "c", shiki: "c" },
  cpp: { prism: "cpp", shiki: "cpp" },
  cs: { prism: "csharp", shiki: "csharp" },
  css: { prism: "css", shiki: "css" },
  csv: { prism: "csv", shiki: "csv" },
  dart: { prism: "dart", shiki: "dart" },
  diff: { prism: "diff", shiki: "diff" },
  docker: { prism: "docker", shiki: "docker" },
  go: { prism: "go", shiki: "go" },
  graphql: { prism: "graphql", shiki: "graphql" },
  html: { prism: "markup", shiki: "html" },
  http: { prism: "http", shiki: "http" },
  ini: { prism: "ini", shiki: "ini" },
  java: { prism: "java", shiki: "java" },
  js: { prism: "javascript", shiki: "javascript" },
  json: { prism: "json", shiki: "json" },
  kt: { prism: "kotlin", shiki: "kotlin" },
  less: { prism: "less", shiki: "less" },
  log: { prism: "log", shiki: "log" },
  lua: { prism: "lua", shiki: "lua" },
  make: { prism: "makefile", shiki: "makefile" },
  md: { prism: "markdown", shiki: "markdown" },
  php: { prism: "php", shiki: "php" },
  pl: { prism: "perl", shiki: "perl" },
  ps1: { prism: "powershell", shiki: "powershell" },
  py: { prism: "python", shiki: "python" },
  rb: { prism: "ruby", shiki: "ruby" },
  regex: { prism: "regex", shiki: "regexp" },
  rs: { prism: "rust", shiki: "rust" },
  scss: { prism: "scss", shiki: "scss" },
  sql: { prism: "sql", shiki: "sql" },
  svelte: { shiki: "svelte" },
  swift: { prism: "swift", shiki: "swift" },
  toml: { prism: "toml", shiki: "toml" },
  ts: { prism: "typescript", shiki: "typescript" },
  uri: { prism: "uri" },
  // Prism has no Vue grammar, so Shiki votes alone here
  vue: { shiki: "vue" },
  xml: { prism: "markup", shiki: "xml" },
  yaml: { prism: "yaml", shiki: "yaml" },
};

/**
 * Prism token name -> coarse class.
 *
 * Prism spells strings a dozen ways (`triple-quoted-string`, `template-string`,
 * `raw-string`, …), so the string family is matched loosely.
 */
const prismClass = (name: string): Klass =>
  /comment|prolog|doctype/.test(name)
    ? "cmnt"
    : /string|\bchar\b|regex/.test(name)
      ? "str"
      : name == "number"
        ? "num"
        : /keyword|boolean/.test(name)
          ? "kwd"
          : "other";

/** TextMate scope prefix -> coarse class, innermost scope wins */
const SCOPES: [string, Klass][] = [
  ["comment", "cmnt"],
  ["constant.character.escape", "str"],
  ["string", "str"],
  ["constant.numeric", "num"],
  ["constant.language.boolean", "kwd"],
  ["keyword", "kwd"],
  ["storage", "kwd"],
];

const scopeClass = (scopes: string[]): Klass => {
  for (let i = scopes.length; i-- > 0;)
    for (const [prefix, klass] of SCOPES) if (scopes[i]!.startsWith(prefix)) return klass;
  return "other";
};

/**
 * Classify every character of `code` the way Prism sees it
 *
 * `refractor.highlight` returns a hast tree whose elements carry the token name
 * in their class list; the innermost element covering a character wins.
 */
export const prismClasses = (code: string, lang: string): Klass[] => {
  const out: Klass[] = Array.from({ length: code.length }, () => "other");
  let i = 0;

  const walk = (nodes: any[], klass: Klass) => {
    for (const node of nodes) {
      if (node.type == "text") {
        for (let k = 0; k < node.value.length; k++) out[i + k] = klass;
        i += node.value.length;
      } else {
        const own = (node.properties?.className ?? []).filter((c: string) => c != "token");
        walk(node.children, own.length > 0 ? prismClass(own[0]) : klass);
      }
    }
  };

  walk(refractor.highlight(code, lang).children, "other");
  return out;
};

/**
 * Classify every character of `code` the way Shiki sees it
 *
 * Shiki tokenizes line by line and strips the line breaks, so the offsets are
 * rebuilt as we go. `includeExplanation` is what exposes the TextMate scopes.
 */
export const shikiClasses = async (code: string, lang: BundledLanguage): Promise<Klass[]> => {
  const highlighter = await getSingletonHighlighter({ langs: [lang], themes: ["github-dark"] }),
    out: Klass[] = Array.from({ length: code.length }, () => "other"),
    { tokens } = highlighter.codeToTokens(code, {
      lang,
      theme: "github-dark",
      includeExplanation: true,
    });

  let i = 0;
  for (const line of tokens) {
    for (const token of line)
      for (const part of token.explanation ?? [{ content: token.content, scopes: [] }]) {
        const klass = scopeClass((part.scopes ?? []).map((s: any) => s.scopeName));
        for (let k = 0; k < part.content.length; k++) out[i + k] = klass;
        i += part.content.length;
      }
    i += 1; // the line break Shiki does not emit
  }

  return out;
};
