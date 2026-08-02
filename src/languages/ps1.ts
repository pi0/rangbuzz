import type { ShjLanguageDefinition } from "../types.ts";

// `$name`, `$env:PATH`, `$script:x`, `${odd name}`, `$_`, `$?`, a `$(…)`
// subexpression (one level of nesting) and an `@splat`
let variable = {
    type: "var",
    match: /\$\((?:[^()]|\([^()]*\))*\)|\$(?:\{[^}]*\}|[\w:]+|[$?^])|@\w+/g,
  },
  // the backtick is the escape character: `n, `t, `" and `$
  interpolated = [{ type: "esc", match: /`[^]/g }, variable];

export default [
  {
    // block comment, with the comment based help keywords picked back out of it
    type: "cmnt",
    match: /<#[^]*?(?:#>|$)/g,
    sub: [{ type: "kwd", match: /(?<=^[ \t]*\.)[a-z]+\b/gim }],
  },
  {
    match: /#.*/g,
    sub: "todo",
  },
  {
    // here-string, closed by `"@` at the very start of a line
    type: "str",
    match: /@"[^]*?^"@/gm,
    sub: interpolated,
  },
  {
    // the single quoted here-string is literal, nothing expands in it
    type: "str",
    match: /@'[^]*?^'@/gm,
  },
  {
    type: "str",
    match: /"(?:`[^]|[^"`])*"?/g,
    sub: interpolated,
  },
  {
    // `''` is how a literal string carries a quote
    type: "str",
    match: /'(?:[^']|'')*'?/g,
  },
  {
    type: "bool",
    match: /\$(?:true|false|null)\b/gi,
  },
  variable,
  {
    // type literal or cast, `[int[]]` and `[System.IO.Path]` included; an
    // attribute such as `[Parameter(…)]` is left to the function rule
    type: "type",
    match: /\[[a-z_][\w.]*(?:\[\])?\]/gi,
  },
  {
    // cmdlet, always Verb-Noun — before the keywords, so `ForEach-Object` does
    // not read as the `foreach` statement
    type: "func",
    match: /\b[a-z]+-[a-z]\w*/gi,
  },
  {
    type: "kwd",
    match:
      /\b(?:begin|break|catch|class|continue|data|default|do|dynamicparam|else|elseif|end|enum|exit|filter|finally|foreach|for|from|function|hidden|if|inlinescript|in|parallel|param|process|return|sequence|static|switch|throw|trap|try|until|using|while|workflow)\b/gi,
  },
  {
    type: "class",
    match: /(?<=\b(?:class|enum)\s+)\w+/gi,
  },
  {
    // word operators — before the parameters, `-eq` is not a `-Path`
    type: "oper",
    match:
      /-(?:eq|ne|ge|gt|le|lt|notlike|like|notmatch|match|notcontains|contains|notin|in|isnot|is|as|and|or|xor|not|band|bor|bxor|bnot|shl|shr|replace|split|join|f)\b/gi,
  },
  {
    // parameter of a cmdlet
    type: "kwd",
    match: /(?<=\s|^)--?[a-z]\w*/gim,
  },
  {
    // decimal, hexadecimal, and the KB/MB/GB/TB/PB multipliers
    type: "num",
    match: /\b0x[\da-f]+\b|(?:\.\d|\b\d)\d*(?:\.\d+)?(?:e[+-]?\d+)?(?:kb|mb|gb|tb|pb)?\b/gi,
  },
  {
    // method or attribute call
    type: "func",
    match: /[a-z_]\w*(?=\s*\()/gi,
  },
  {
    type: "oper",
    match: /::|[-=+*/%!<>|&,;.@]+/g,
  },
] as ShjLanguageDefinition;
