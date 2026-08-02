import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, CLASS, ESC, FUNC, KWD, NUM, OPER, STR, TYPE, VAR } from "../tokens.ts";

// what a double quoted string, a heredoc body, a backtick command and a `%Q()`
// literal all carry: backslash escapes and `#{...}` interpolation (one level of
// nested braces, so `#{h[:k]}` and `#{ {a: 1} }` stay inside the hole)
const interpolated = [
  [/\\[^]/g, ESC],
  [/#\{(?:[^{}]|\{[^{}]*\})*\}?/g, VAR],
];

export default [
  // `=begin`/`=end` only count on their own line, `#` runs to the end of it
  [/^=begin\b[^]*?^=end.*|#.*/gm, , "todo"],
  // a heredoc whose tag is single quoted is literal: nothing interpolates
  [/<<[-~]?'([A-Z_]\w*)'[^]*?^[\t ]*\1\b/gm, STR],
  // heredoc: the tag has to be uppercase, otherwise `a <<b` would open one.
  // `<<~` and `<<-` allow the terminator to be indented, plain `<<` does not,
  // but accepting it either way costs nothing and never mis-closes
  [/<<[-~]?(["`]?)([A-Z_]\w*)\1[^]*?^[\t ]*\2\b/gm, STR, interpolated],
  // %w[] %i[] %q() %Q{} %r<>i %x`` %s|…| and the bare %[] %() %{} %<> forms.
  // Delimiters nest one level, which is what `%r{\d{3}}` needs. A free
  // delimiter is only accepted after the type letter, so that `a % b` and
  // `100 % n` stay arithmetic
  [
    /%[qQwWiIrsx]?(?:\[(?:\\[^]|\[[^[\]]*\]|[^[\]])*\]|\((?:\\[^]|\([^()]*\)|[^()])*\)|\{(?:\\[^]|\{[^{}]*\}|[^{}])*\}|<(?:\\[^]|<[^<>]*>|[^<>])*>)[a-z]*|%[qQwWiIrsx]([^\s\w])(?:\\[^]|(?!\1)[^])*\1/g,
    STR,
    interpolated,
  ],
  // `#{...}` is consumed whole, so a quote inside it does not end the string
  [/"(?:\\[^]|#\{(?:[^{}]|\{[^{}]*\})*\}|[^"\\])*"?/g, STR, interpolated],
  // single quotes interpolate nothing, only `\'` and `\\` are escapes
  [/'(?:\\[^]|[^'\\])*'?/g, STR],
  // backtick command substitution
  [/`(?:\\[^]|[^`\\])*`?/g, STR, interpolated],
  // `/` is both division and a regex delimiter and no regex can tell them
  // apart for sure, so a literal is only recognised where a division cannot
  // appear: after an operator, an opening bracket, a comma, a keyword or one
  // of the methods that idiomatically take a pattern bare, or at the start of
  // a line. `total / count` stays arithmetic; a pattern handed bare to some
  // other method is missed
  [
    /(?<=[=(,~!|&[{;]\s*|\b(?:when|in|and|or|not|match|g?sub|split|scan|grep|index)\s|^\s*)\/(?:\\[^]|\[(?:\\[^]|[^\r\n\]])*\]|[^\r\n\\/])+\/[imxounse]*/gm,
    STR,
  ],
  // character literal: `?a`, `?\n`
  [/\?(?:\\\w|[^\s\\])(?![\w?!])/g, ESC],
  // `:sym`, `:sym?`, `:"quoted sym"` and the `key:` shorthand — never `::`
  [/(?<!:):(?!:)(?:[a-z_]\w*[?!=]?|"(?:\\[^]|[^"])*")|\b[a-z_]\w*[?!]?(?=:(?![:=]))/gi, TYPE],
  // instance, class and global variables, including the punctuation globals
  [/@@?[a-z_]\w*|\$(?:[a-z_]\w*|[!@&`'+~=/\\,;.<>_*$?:0-9])/gi, VAR],
  // hex, binary and octal, digit separators, floats, exponents, and the
  // rational / imaginary suffixes
  [/\b0[box][\da-f_]+r?i?|\b\d[\d_]*(?:\.\d[\d_]*)?(?:e[+-]?\d+)?r?i?\b/gi, NUM],
  // `nil?` is a predicate method, not the literal
  [/\b(true|false|nil)\b(?![?!])/g, BOOL],
  [
    /\bdefined\?|\b(__ENCODING__|__FILE__|__LINE__|__dir__|__method__|BEGIN|END|alias|alias_method|and|attr_accessor|attr_reader|attr_writer|begin|break|case|catch|class|def|define_method|do|else|elsif|end|ensure|extend|for|if|in|include|lambda|module|module_function|new|next|not|or|prepend|private|proc|protected|public|raise|redo|require|require_relative|rescue|retry|return|self|super|then|throw|undef|unless|until|when|while|yield)\b/g,
    KWD,
  ],
  // the name a `def` introduces, `self.` prefix and `?`/`!`/`=` suffix alike
  [/(?<=\bdef\s+(?:self\.)?)[a-z_]\w*[?!=]?/gi, FUNC],
  // constants, class names and namespaces
  [/\b[A-Z]\w*/g, CLASS],
  // a call, and the `?`/`!` suffixed methods that need no parentheses
  [/\b[a-z_]\w*[?!](?![=~])|[a-z_]\w*(?=\s*\()/gi, FUNC],
  // `&.`, `<=>`, `**`, `..`, `=~`, `||=` … all fall out of the run. `:` is
  // kept out of it so that `&:name` and `a ? b : c` do not swallow the colon
  // a symbol starts with
  [/:+[-+*/%~!&|^<>=?,.]*|[-+*/%~!&|^<>=?,.]+/g, OPER],
] as ShjLanguageDefinition;
