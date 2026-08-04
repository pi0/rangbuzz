import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, CLASS, ESC, FUNC, KWD, NUM, OPER, STR, TYPE, VAR } from "../tokens.ts";
import { bracket } from "../common.ts";

// `$name` and `${expr}`, the only holes a Kotlin string literal has; one level
// of nested braces covers the lambdas and the calls that show up in practice
const interpolation =
    // `${…}` holds an expression, `$name` a bare identifier: only the first is
    // worth handing back to the language itself
    [/\$\w+|\$\{([^{}]|\{[^{}]*\})*\}?/g, VAR, [[/(?<=^\$\{)[^]*(?=\}$)/g, , "kt"]]],
  // `\uXXXX` is the one escape longer than two characters
  escape = [/\\u[\da-fA-F]{4}|\\[^]/g, ESC];

export default [
  // kdoc: the tags and the `[links]` are worth picking out of it
  [/\/\*\*((?!\*\/)[^])*(\*\/)?/g, , "jsdoc"],
  [/\/\/.*\n?/g, , "todo"],
  // block comments nest: `/* /* */ */` is one comment, and the inner `*/`
  // closes nothing. No regex can count, so the depth is tracked by hand.
  [
    new (class {
      lastIndex = 0;
      exec(src: string) {
        const start = src.indexOf("/*", this.lastIndex);
        if (start < 0) return null;

        let depth = 0,
          i = start;
        while (i < src.length) {
          if (src[i] == "/" && src[i + 1] == "*") {
            depth++;
            i += 2;
          } else if (src[i] == "*" && src[i + 1] == "/") {
            i += 2;
            if (!--depth) break;
          } else i++;
        }
        this.lastIndex = i;
        return { index: start, 0: src.slice(start, i) };
      }
    })(),
    ,
    "todo",
  ],
  // raw string: no escapes at all, and it ends at the first `"""`
  [/"""[^]*?"""/g, STR, [interpolation]],
  // an escaped `$` is matched first, so it cannot open an interpolation
  [/"((?!")[^\r\n\\]|\\[^])*"?/g, STR, [escape, interpolation]],
  // a char literal is always closed on the same line
  [/'(\\u[\da-fA-F]{0,4}|\\[^]|[^\r\n\\'])'/g, STR, [escape]],
  // digit separators, and the `f`/`L`/`u`/`uL` suffixes, are part of the
  // number, and so are the `0x`/`0b` prefixes
  [/(\.|\b)\d[\d_]*(\.\d[\d_]*)?(e[+-]?\d+)?\w*/gi, NUM],
  // annotation, with its optional use-site target: `@Composable`, `@field:Json`
  [/@(\w+:)?[A-Z]\w*/g, TYPE],
  [/\b(true|false|null)\b/g, BOOL],
  // the lookbehind keeps a member access out of it: `Db.open()` is a call,
  // not the `open` modifier. The use-site targets (`field`, `param`, …) are
  // left out on purpose — they are only keywords inside an annotation, which
  // the rule above already claims whole.
  [
    /(?<!\.)\b(abstract|actual|annotation|as|break|by|catch|class|companion|const|constructor|continue|crossinline|data|do|dynamic|else|enum|expect|external|field|final|finally|for|fun|get|if|import|in|infix|init|inline|inner|interface|internal|is|lateinit|noinline|object|open|operator|out|override|package|private|protected|public|reified|return|sealed|set|super|suspend|tailrec|this|throw|try|typealias|val|var|vararg|when|where|while)\b/g,
    KWD,
  ],
  // a loop or lambda label: `loop@`, `return@forEach`
  [/\b\w+@|@\w+\b/g, VAR],
  // the implicit parameter of a single argument lambda
  [/\bit\b/g, VAR],
  // the infix members that read as operators, as Prism does
  [/[/*+:?&|%^~=!,<>.^-]+|\b(and|inv|or|shl|shr|ushr|xor|to|downTo|until|step)\b/g, OPER],
  // a call, or the receiver of a trailing lambda: `lazy { … }`
  [/[a-zA-Z_]\w*(?=\s*\()|[a-z_]\w*(?=\s*\{)/g, FUNC],
  [/\b[A-Z]\w*\b/g, CLASS],
  bracket,
] as ShjLanguageDefinition;
