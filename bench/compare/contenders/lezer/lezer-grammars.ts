/**
 * Every Lezer parser this run can reach, the map from our languages to them,
 * and the renderer that turns one parse into the same class-name markup Prism
 * and highlight.js emit. See `./lezer.ts` for the `Contender` this feeds.
 */

import type { Parser } from "@lezer/common";
import { parser as cpp } from "@lezer/cpp";
import { parser as css } from "@lezer/css";
import { parser as go } from "@lezer/go";
import { classHighlighter, highlightCode } from "@lezer/highlight";
import { configureNesting, parser as html } from "@lezer/html";
import { parser as java } from "@lezer/java";
import { parser as javascript } from "@lezer/javascript";
import { parser as json } from "@lezer/json";
import { parser as markdown } from "@lezer/markdown";
import { parser as php } from "@lezer/php";
import { parser as python } from "@lezer/python";
import { parser as rust } from "@lezer/rust";
import { parser as sass } from "@lezer/sass";
import { parser as xml } from "@lezer/xml";
import { parser as yaml } from "@lezer/yaml";

import type { ShjLanguage } from "../../../../src/types.ts";

/**
 * The nesting `@codemirror/lang-html` configures, as the source of it.
 *
 * Lezer's HTML parser highlights a `<script>` body as text unless it is told
 * what to hand it to, which the language package does and the parser package
 * does not. Ours highlights both, so does Prism's `markup` and so does Shiki's
 * `html`, and a row where the JavaScript inside a page is never parsed would be
 * winning on work it did not do. Cut to the two tags the corpus reaches, and
 * without the `attrs` predicates `lang-html` uses to route `type="text/babel"`
 * at a JSX parser — a nesting rule nothing here would take.
 */
const HTML_NESTING = `configureNesting([{ tag: "script", parser: javascript }, { tag: "style", parser: css }])`;

/**
 * One Lezer parser, and the source that builds it
 *
 * The two halves are the same thing twice — the parser this process highlights
 * with, and the expression a consumer's bundle builds — because one of them has
 * to be text before rolldown can see it. They are written side by side so the
 * benchmark cannot end up timing a parser the bundle does not contain.
 */
export interface LezerGrammar {
  /** The parser, configured as the benchmark hands it code */
  parser: Parser;
  /**
   * The packages whose `parser` export {@link LezerGrammar.expr} reads
   *
   * Bound to the last segment of the name, so `@lezer/javascript` arrives as
   * `javascript` — which is what the expressions below are written over. More
   * than one where a parser embeds another, as HTML embeds both of ours.
   */
  from: string[];
  /** Anything else that expression needs imported, as source */
  imports?: string;
  /** The expression building the parser, over the bindings {@link LezerGrammar.from} names */
  expr: string;
}

/**
 * Every Lezer parser this run can reach, keyed by the name {@link LEZER} uses.
 *
 * A dialect is a key of its own rather than an option passed at highlight time:
 * `configure()` builds a parser, and building one per block would be timing the
 * setup the other contenders did before the clock started. So TypeScript, JSX
 * and TSX are three more parsers off the one JavaScript grammar, exactly as
 * `@codemirror/lang-javascript` derives them.
 */
export const LEZER_GRAMMARS = {
  cpp: { parser: cpp, from: ["@lezer/cpp"], expr: "cpp" },
  css: { parser: css, from: ["@lezer/css"], expr: "css" },
  go: { parser: go, from: ["@lezer/go"], expr: "go" },
  html: {
    parser: html.configure({
      wrap: configureNesting([
        { tag: "script", parser: javascript },
        { tag: "style", parser: css },
      ]),
    }),
    from: ["@lezer/html", "@lezer/javascript", "@lezer/css"],
    imports: `import { configureNesting } from "@lezer/html";`,
    expr: `html.configure({ wrap: ${HTML_NESTING} })`,
  },
  java: { parser: java, from: ["@lezer/java"], expr: "java" },
  javascript: { parser: javascript, from: ["@lezer/javascript"], expr: "javascript" },
  json: { parser: json, from: ["@lezer/json"], expr: "json" },
  jsx: {
    parser: javascript.configure({ dialect: "jsx" }),
    from: ["@lezer/javascript"],
    expr: `javascript.configure({ dialect: "jsx" })`,
  },
  markdown: { parser: markdown, from: ["@lezer/markdown"], expr: "markdown" },
  php: { parser: php, from: ["@lezer/php"], expr: "php" },
  python: { parser: python, from: ["@lezer/python"], expr: "python" },
  rust: { parser: rust, from: ["@lezer/rust"], expr: "rust" },
  sass: { parser: sass, from: ["@lezer/sass"], expr: "sass" },
  typescript: {
    parser: javascript.configure({ dialect: "ts" }),
    from: ["@lezer/javascript"],
    expr: `javascript.configure({ dialect: "ts" })`,
  },
  tsx: {
    parser: javascript.configure({ dialect: "jsx ts" }),
    from: ["@lezer/javascript"],
    expr: `javascript.configure({ dialect: "jsx ts" })`,
  },
  xml: { parser: xml, from: ["@lezer/xml"], expr: "xml" },
  yaml: { parser: yaml, from: ["@lezer/yaml"], expr: "yaml" },
} satisfies Record<string, LezerGrammar>;

/** What {@link LEZER_GRAMMARS} calls a parser */
export type LezerName = keyof typeof LEZER_GRAMMARS;

/**
 * Our language -> the Lezer parser it is highlighted by, `null` where there is
 * none.
 *
 * The shortest map of the four, and not because the project is young: Lezer
 * grammars are LR parsers generated from a grammar file, so one exists where
 * somebody wrote a whole language down and nowhere else. There is no Lezer for
 * `bash`, `sql`, `toml` or `diff` the way there is a hundred line regex file
 * for each of them here — which is most of the argument for both designs, in
 * one column.
 *
 * `c` is C++'s parser, which is what `@codemirror/language-data` loads for a
 * `.c` file, and `scss` is the Sass one, whose default dialect is SCSS and
 * whose `indented` dialect is the other syntax. Neither is a stand-in chosen
 * here: both are the parser a CodeMirror editor opens that file with.
 */
export const LEZER: Record<ShjLanguage, LezerName | null> = {
  asm: null,
  astro: null,
  bash: null,
  c: "cpp",
  cpp: "cpp",
  cs: null,
  css: "css",
  csv: null,
  dart: null,
  diff: null,
  docker: null,
  go: "go",
  graphql: null,
  html: "html",
  http: null,
  ini: null,
  java: "java",
  js: "javascript",
  jsdoc: null,
  json: "json",
  jsx: "jsx",
  kt: null,
  less: null,
  log: null,
  lua: null,
  make: null,
  md: "markdown",
  php: "php",
  pl: null,
  plain: null,
  ps1: null,
  py: "python",
  rb: null,
  regex: null,
  rs: "rust",
  scss: "sass",
  sql: null,
  svelte: null,
  swift: null,
  toml: null,
  ts: "typescript",
  tsx: "tsx",
  uri: null,
  vue: null,
  xml: "xml",
  yaml: "yaml",
};

/**
 * One block through Lezer: parse it, walk the tree, write the spans out
 *
 * `highlightCode()` is the whole of what `@lezer/highlight` offers a renderer
 * that is not an editor — it walks the tree the parser just built and calls
 * back with a run of text and the classes for it, `classHighlighter` being the
 * mapping from a highlight tag to the `tok-` names CodeMirror's own themes are
 * written against. The escaping is the caller's, which is why it is in here:
 * the text arrives raw, and every other contender escapes inside the call this
 * is being timed against — the same three characters ours does.
 *
 * @param code The block
 * @param parser The parser for it, from {@link LEZER_GRAMMARS}
 * @returns The highlighted HTML
 */
export const lezerHtml = (code: string, parser: Parser): string => {
  let out = "";

  highlightCode(
    code,
    parser.parse(code),
    classHighlighter,
    (text, classes) => {
      const escaped = /[&<>]/.test(text)
        ? text.replaceAll("&", "&#38;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
        : text;

      out += classes ? `<span class="${classes}">${escaped}</span>` : escaped;
    },
    () => {
      out += "\n";
    },
  );

  return out;
};
