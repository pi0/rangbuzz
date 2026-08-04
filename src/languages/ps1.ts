import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, CLASS, CMNT, ESC, FUNC, KWD, NUM, OPER, STR, TYPE, VAR } from "../tokens.ts";
import { bracket } from "../common.ts";

// `$name`, `$env:PATH`, `$script:x`, `${odd name}`, `$_`, `$?`, a `$(…)`
// subexpression (one level of nesting) and an `@splat`
let variable = [/\$\((?:[^()]|\([^()]*\))*\)|\$(?:\{[^}]*\}|[\w:]+|[$?^])|@\w+/g, VAR],
  // the backtick is the escape character: `n, `t, `" and `$
  interpolated = [[/`[^]/g, ESC], variable];

export default [
  // block comment, with the comment based help keywords picked back out of it
  [/<#[^]*?(?:#>|$)/g, CMNT, [[/(?<=^[ \t]*\.)[a-z]+\b/gim, KWD]]],
  [/#.*/g, , "todo"],
  // here-string, closed by `"@` at the very start of a line
  [/@"[^]*?^"@/gm, STR, interpolated],
  // the single quoted here-string is literal, nothing expands in it
  [/@'[^]*?^'@/gm, STR],
  [/"(?:`[^]|[^"`])*"?/g, STR, interpolated],
  // `''` is how a literal string carries a quote
  [/'(?:[^']|'')*'?/g, STR],
  [/\$(?:true|false|null)\b/gi, BOOL],
  variable,
  // type literal or cast, `[int[]]` and `[System.IO.Path]` included; an
  // attribute such as `[Parameter(…)]` is left to the function rule
  [/\[[a-z_][\w.]*(?:\[\])?\]/gi, TYPE],
  // cmdlet, always Verb-Noun — before the keywords, so `ForEach-Object` does
  // not read as the `foreach` statement
  [/\b[a-z]+-[a-z]\w*/gi, FUNC],
  [
    /\b(?:begin|break|catch|class|continue|data|default|do|dynamicparam|else|elseif|end|enum|exit|filter|finally|foreach|for|from|function|hidden|if|inlinescript|in|parallel|param|process|return|sequence|static|switch|throw|trap|try|until|using|while|workflow)\b/gi,
    KWD,
  ],
  [/(?<=\b(?:class|enum)\s+)\w+/gi, CLASS],
  // word operators — before the parameters, `-eq` is not a `-Path`
  [
    /-(?:eq|ne|ge|gt|le|lt|notlike|like|notmatch|match|notcontains|contains|notin|in|isnot|is|as|and|or|xor|not|band|bor|bxor|bnot|shl|shr|replace|split|join|f)\b/gi,
    OPER,
  ],
  // parameter of a cmdlet
  [/(?<=\s|^)--?[a-z]\w*/gim, KWD],
  // decimal, hexadecimal, and the KB/MB/GB/TB/PB multipliers
  [/\b0x[\da-f]+\b|(?:\.\d|\b\d)\d*(?:\.\d+)?(?:e[+-]?\d+)?(?:kb|mb|gb|tb|pb)?\b/gi, NUM],
  // method or attribute call
  [/[a-z_]\w*(?=\s*\()/gi, FUNC],
  [/::|[-=+*/%!<>|&,;.@]+/g, OPER],
  bracket,
] as ShjLanguageDefinition;
