import type { ShjLanguageDefinition } from "../types.ts";

// what lives inside an interpolating string: heredoc, double quoted, backtick
const escape = {
    type: "esc",
    match: /\\(u\{[\da-f]+\}|x[\da-f]{1,2}|[0-7]{1,3}|[^])/gi,
  },
  // simple `$name`, `$a[k]`, `$o->p`, and the `{$expr}` / `${name}` complex forms
  interpolation = {
    type: "var",
    match: /\{\$[^{}\r\n]*\}|\$\{[^}\r\n]*\}|\$+\w+(\[[^\]\r\n]*\]|->\w+)?/g,
  },
  interpolated = [escape, interpolation];

export default [
  {
    // docblock
    match: /\/\*\*((?!\*\/)[^])*(\*\/)?/g,
    sub: "jsdoc",
  },
  {
    // `#[` opens an attribute, not a comment
    match: /\/\/.*\n?|#(?!\[).*\n?|\/\*((?!\*\/)[^])*(\*\/)?/g,
    sub: "todo",
  },
  {
    // open and close tags, `<?=` being the short echo
    type: "kwd",
    match: /<\?(php\b|=)?|\?>/g,
  },
  {
    // outside the tags nothing is PHP, it is the page the code is embedded in
    match: /^(?!<\?)[^]+?(?=<\?|$)|(?<=\?>)[^]+?(?=<\?|$)/g,
    sub: "html",
  },
  {
    // nowdoc: quoted with `'`, nothing inside it is interpolated
    type: "str",
    match: /<<<'(\w+)'[^]*?\n[ \t]*\1\b/g,
  },
  {
    // heredoc, the delimiter optionally quoted with `"`
    type: "str",
    match: /<<<("?)(\w+)\1[^]*?\n[ \t]*\2\b/g,
    sub: interpolated,
  },
  {
    // single quoted, and unlike the others it may hold an unescaped `$`
    type: "str",
    match: /'((?!')[^\\]|\\[^])*'?/g,
  },
  {
    type: "str",
    match: /"((?!")[^\\]|\\[^])*"?/g,
    sub: interpolated,
  },
  {
    // backtick: shell execution, interpolating like a double quoted string
    type: "str",
    match: /`((?!`)[^\\]|\\[^])*`?/g,
    sub: interpolated,
  },
  {
    // attribute, its arguments left to the rules below
    type: "kwd",
    match: /#\[/g,
  },
  {
    type: "num",
    match: /\b0[box][\da-f_]+|(\b\d[\d_]*\.?[\d_]*|\B\.\d[\d_]*)(e[+-]?\d+)?/gi,
  },
  {
    // `$$name` is a variable variable
    type: "var",
    match: /\$+\w+/g,
  },
  {
    // a method, reached through an object or a class
    type: "func",
    match: /(?<=(->|::)\s*)\w+(?=\s*\()/g,
  },
  {
    // a property: also keeps `$o->list` from reading as a keyword
    type: "var",
    match: /(?<=->\s*)\w+/g,
  },
  {
    // named argument
    type: "var",
    match: /(?<=[(,]\s*)[a-z_]\w*(?=\s*:(?!:))/gi,
  },
  {
    type: "bool",
    match: /\b(true|false|null)\b/gi,
  },
  {
    // a cast: `array` and `unset` are keywords anywhere else
    type: "type",
    match:
      /(?<=\(\s*)(array|binary|bool|boolean|double|float|int|integer|object|real|string|unset)(?=\s*\))/gi,
  },
  {
    type: "kwd",
    match:
      /(?<=\byield\s+)from\b|\b(__CLASS__|__DIR__|__FILE__|__FUNCTION__|__LINE__|__METHOD__|__NAMESPACE__|__TRAIT__|__halt_compiler|abstract|and|array|as|break|case|catch|class|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|enum|eval|exit|extends|final|finally|fn|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset|list|match|namespace|new|or|parent|print|private|protected|public|readonly|require|require_once|return|self|static|switch|throw|trait|try|unset|use|var|while|xor|yield)\b/g,
  },
  {
    type: "type",
    match: /\b(bool|callable|float|int|iterable|mixed|never|object|string|void)\b/g,
  },
  {
    // the name a declaration, an instantiation or an attribute introduces
    type: "class",
    match:
      /(?<=\b(?:class|enum|extends|implements|instanceof|interface|new|trait)\s+|#\[\s*)\\?\w+(\\\w+)*/g,
  },
  {
    type: "func",
    match: /[a-zA-Z_]\w*(?=\s*\()/g,
  },
  {
    type: "class",
    match: /\b[A-Z]\w*\b|\b[a-z_]\w*(?=\s*::)/g,
  },
  {
    type: "oper",
    match: /[!%&*+,.:<=>?^|~/\\-]+/g,
  },
] as ShjLanguageDefinition;
