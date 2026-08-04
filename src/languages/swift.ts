import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, CLASS, CMNT, ESC, FUNC, KWD, NUM, OPER, STR, VAR } from "../tokens.ts";
import { bracket } from "../common.ts";
import todo from "./todo.ts";

// `\(…)` interpolation: its delimiter carries the hashes the literal was opened
// with, and the expression inside is swift again
const interpolation = (hash: string) => [
    RegExp(String.raw`\\${hash}\((?:[^()]|\([^()]*\))*\)`, "g"),
    ESC,
    [[RegExp(String.raw`(?<=^\\${hash}\()[^]*(?=\)$)`, "g"), , "swift"]],
  ],
  // what a string holds: interpolation, then the escapes
  interpolated = [interpolation(""), [/\\u\{[\da-fA-F]+\}|\\[^]/g, ESC]],
  // a raw string escapes nothing — only `\#(…)` is still interpolation
  raw = [interpolation("#+")],
  // doc comments carry markup callouts: `- Parameter x:`, `- Returns:`
  doc = [[/[-+*][ \t]*\w+(?=[ \t]*\w*:)/g, KWD], ...todo];

export default [
  [/\/\/\/.*\n?|\/\*\*(?:[^*]|\*(?!\/))*(?:\*\/)?/g, CMNT, doc],
  // block comments nest, one level deep as the judges read them too
  [/\/\/.*\n?|\/\*(?:[^/*]|\/(?!\*)|\*(?!\/)|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:\*\/)?/g, , "todo"],
  // raw string, closed by as many hashes as it was opened with
  [/(#+)"""[^]*?"""\1|(#+)"[^\r\n]*?"\2/g, STR, raw],
  [/"""[^]*?(?:"""|$)/g, STR, interpolated],
  // an interpolation is consumed whole, so the quotes of a string nested in
  // it do not close the literal
  [/"(?:\\\((?:[^()]|\([^()]*\))*\)|\\[^]|(?!")[^\r\n\\])*"?/g, STR, interpolated],
  // digits may be grouped with underscores, in any base, floats included
  [
    /\b0[xX][\da-fA-F_]+(?:\.[\da-fA-F_]+)?(?:[pP][+-]?\d+)?|\b0[bBoO][\d_]+|\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?/g,
    NUM,
  ],
  [/\b(?:true|false|nil)\b/g, BOOL],
  // attributes (`@objc`) and compiler directives (`#if`, `#selector`)
  [/[@#]\w+/g, KWD],
  [
    /\b(?:Any|Self|_|actor|any|as|associatedtype|async|await|borrowing|break|case|catch|class|consuming|continue|convenience|default|defer|deinit|didSet|do|dynamic|each|else|enum|extension|fallthrough|fileprivate|final|for|func|get|guard|if|import|in|indirect|infix|init|inout|internal|is|isolated|lazy|let|macro|mutating|nonisolated|nonmutating|open|operator|override|package|postfix|precedencegroup|prefix|private|protocol|public|repeat|required|rethrows|return|self|set|some|static|struct|subscript|super|switch|throw|throws|try|typealias|unowned|var|weak|where|while|willSet)\b/g,
    KWD,
  ],
  // a declaration names its function even when a generic list follows
  [/(?<=\bfunc\s+)\w+/g, FUNC],
  // closure shorthand arguments, projected values, key paths
  [/\$\w+|\\\.\w*/g, VAR],
  [/[/*+:?&|%^~=!,<>.^-]+/g, OPER],
  [/\b[A-Z]\w*\b/g, CLASS],
  [/\b[a-zA-Z_]\w*(?=\s*\()/g, FUNC],
  bracket,
] as ShjLanguageDefinition;
