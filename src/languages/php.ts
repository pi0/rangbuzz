import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, CLASS, ESC, FUNC, KWD, NUM, OPER, STR, TYPE, VAR } from "../tokens.ts";
import { bracket } from "../common.ts";

// what lives inside an interpolating string: heredoc, double quoted, backtick
const escape = [/\\(u\{[\da-f]+\}|x[\da-f]{1,2}|[0-7]{1,3}|[^])/gi, ESC],
  // simple `$name`, `$a[k]`, `$o->p`, and the `{$expr}` / `${name}` complex forms
  interpolation = [/\{\$[^{}\r\n]*\}|\$\{[^}\r\n]*\}|\$+\w+(\[[^\]\r\n]*\]|->\w+)?/g, VAR],
  interpolated = [escape, interpolation];

export default [
  // docblock
  [/\/\*\*((?!\*\/)[^])*(\*\/)?/g, , "jsdoc"],
  // `#[` opens an attribute, not a comment
  [/\/\/.*\n?|#(?!\[).*\n?|\/\*((?!\*\/)[^])*(\*\/)?/g, , "todo"],
  // open and close tags, `<?=` being the short echo
  [/<\?(php\b|=)?|\?>/g, KWD],
  // outside the tags nothing is PHP, it is the page the code is embedded in
  [/^(?!<\?)[^]+?(?=<\?|$)|(?<=\?>)[^]+?(?=<\?|$)/g, , "html"],
  // nowdoc: quoted with `'`, nothing inside it is interpolated
  [/<<<'(\w+)'[^]*?\n[ \t]*\1\b/g, STR],
  // heredoc, the delimiter optionally quoted with `"`
  [/<<<("?)(\w+)\1[^]*?\n[ \t]*\2\b/g, STR, interpolated],
  // single quoted, and unlike the others it may hold an unescaped `$`
  [/'((?!')[^\\]|\\[^])*'?/g, STR],
  [/"((?!")[^\\]|\\[^])*"?/g, STR, interpolated],
  // backtick: shell execution, interpolating like a double quoted string
  [/`((?!`)[^\\]|\\[^])*`?/g, STR, interpolated],
  // attribute, its arguments left to the rules below
  [/#\[/g, KWD],
  [/\b0[box][\da-f_]+|(\b\d[\d_]*\.?[\d_]*|\B\.\d[\d_]*)(e[+-]?\d+)?/gi, NUM],
  // `$$name` is a variable variable
  [/\$+\w+/g, VAR],
  // a method, reached through an object or a class
  [/(?<=(->|::)\s*)\w+(?=\s*\()/g, FUNC],
  // a property: also keeps `$o->list` from reading as a keyword
  [/(?<=->\s*)\w+/g, VAR],
  // named argument
  [/(?<=[(,]\s*)[a-z_]\w*(?=\s*:(?!:))/gi, VAR],
  [/\b(true|false|null)\b/gi, BOOL],
  // a cast: `array` and `unset` are keywords anywhere else
  [
    /(?<=\(\s*)(array|binary|bool|boolean|double|float|int|integer|object|real|string|unset)(?=\s*\))/gi,
    TYPE,
  ],
  [
    /(?<=\byield\s+)from\b|\b(__CLASS__|__DIR__|__FILE__|__FUNCTION__|__LINE__|__METHOD__|__NAMESPACE__|__TRAIT__|__halt_compiler|abstract|and|array|as|break|case|catch|class|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|enum|eval|exit|extends|final|finally|fn|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset|list|match|namespace|new|or|parent|print|private|protected|public|readonly|require|require_once|return|self|static|switch|throw|trait|try|unset|use|var|while|xor|yield)\b/g,
    KWD,
  ],
  [/\b(bool|callable|float|int|iterable|mixed|never|object|string|void)\b/g, TYPE],
  // the name a declaration, an instantiation or an attribute introduces
  [
    /(?<=\b(?:class|enum|extends|implements|instanceof|interface|new|trait)\s+|#\[\s*)\\?\w+(\\\w+)*/g,
    CLASS,
  ],
  [/[a-zA-Z_]\w*(?=\s*\()/g, FUNC],
  [/\b[A-Z]\w*\b|\b[a-z_]\w*(?=\s*::)/g, CLASS],
  [/[!%&*+,.:<=>?^|~/\\-]+/g, OPER],
  bracket,
] as ShjLanguageDefinition;
