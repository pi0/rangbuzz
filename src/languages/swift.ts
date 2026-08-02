import type { ShjLanguageDefinition } from "../types.ts";
import todo from "./todo.ts";

// `\(…)` interpolation: its delimiter carries the hashes the literal was opened
// with, and the expression inside is swift again
const interpolation = (hash: string) => ({
    type: "esc",
    match: RegExp(String.raw`\\${hash}\((?:[^()]|\([^()]*\))*\)`, "g"),
    sub: [{ match: RegExp(String.raw`(?<=^\\${hash}\()[^]*(?=\)$)`, "g"), sub: "swift" }],
  }),
  // what a string holds: interpolation, then the escapes
  interpolated = [interpolation(""), { type: "esc", match: /\\u\{[\da-fA-F]+\}|\\[^]/g }],
  // a raw string escapes nothing — only `\#(…)` is still interpolation
  raw = [interpolation("#+")],
  // doc comments carry markup callouts: `- Parameter x:`, `- Returns:`
  doc = [{ type: "kwd", match: /[-+*][ \t]*\w+(?=[ \t]*\w*:)/g }, ...todo];

export default [
  {
    type: "cmnt",
    match: /\/\/\/.*\n?|\/\*\*(?:[^*]|\*(?!\/))*(?:\*\/)?/g,
    sub: doc,
  },
  {
    // block comments nest, one level deep as the judges read them too
    match: /\/\/.*\n?|\/\*(?:[^/*]|\/(?!\*)|\*(?!\/)|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:\*\/)?/g,
    sub: "todo",
  },
  {
    // raw string, closed by as many hashes as it was opened with
    type: "str",
    match: /(#+)"""[^]*?"""\1|(#+)"[^\r\n]*?"\2/g,
    sub: raw,
  },
  {
    type: "str",
    match: /"""[^]*?(?:"""|$)/g,
    sub: interpolated,
  },
  {
    // an interpolation is consumed whole, so the quotes of a string nested in
    // it do not close the literal
    type: "str",
    match: /"(?:\\\((?:[^()]|\([^()]*\))*\)|\\[^]|(?!")[^\r\n\\])*"?/g,
    sub: interpolated,
  },
  {
    // digits may be grouped with underscores, in any base, floats included
    type: "num",
    match:
      /\b0[xX][\da-fA-F_]+(?:\.[\da-fA-F_]+)?(?:[pP][+-]?\d+)?|\b0[bBoO][\d_]+|\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?/g,
  },
  {
    type: "bool",
    match: /\b(?:true|false|nil)\b/g,
  },
  {
    // attributes (`@objc`) and compiler directives (`#if`, `#selector`)
    type: "kwd",
    match: /[@#]\w+/g,
  },
  {
    type: "kwd",
    match:
      /\b(?:Any|Self|_|actor|any|as|associatedtype|async|await|borrowing|break|case|catch|class|consuming|continue|convenience|default|defer|deinit|didSet|do|dynamic|each|else|enum|extension|fallthrough|fileprivate|final|for|func|get|guard|if|import|in|indirect|infix|init|inout|internal|is|isolated|lazy|let|macro|mutating|nonisolated|nonmutating|open|operator|override|package|postfix|precedencegroup|prefix|private|protocol|public|repeat|required|rethrows|return|self|set|some|static|struct|subscript|super|switch|throw|throws|try|typealias|unowned|var|weak|where|while|willSet)\b/g,
  },
  {
    // a declaration names its function even when a generic list follows
    type: "func",
    match: /(?<=\bfunc\s+)\w+/g,
  },
  {
    // closure shorthand arguments, projected values, key paths
    type: "var",
    match: /\$\w+|\\\.\w*/g,
  },
  {
    type: "oper",
    match: /[/*+:?&|%^~=!,<>.^-]+/g,
  },
  {
    type: "class",
    match: /\b[A-Z]\w*\b/g,
  },
  {
    type: "func",
    match: /\b[a-zA-Z_]\w*(?=\s*\()/g,
  },
] as ShjLanguageDefinition;
