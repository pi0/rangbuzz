import type { ShjLanguageDefinition } from "../types.ts";

// `$name` and `${expr}`, the only holes a Kotlin string literal has; one level
// of nested braces covers the lambdas and the calls that show up in practice
const interpolation = {
    type: "var",
    match: /\$\w+|\$\{([^{}]|\{[^{}]*\})*\}?/g,
    // `${…}` holds an expression, `$name` a bare identifier: only the first is
    // worth handing back to the language itself
    sub: [{ match: /(?<=^\$\{)[^]*(?=\}$)/g, sub: "kt" }],
  },
  // `\uXXXX` is the one escape longer than two characters
  escape = {
    type: "esc",
    match: /\\u[\da-fA-F]{4}|\\[^]/g,
  };

export default [
  {
    // kdoc: the tags and the `[links]` are worth picking out of it
    match: /\/\*\*((?!\*\/)[^])*(\*\/)?/g,
    sub: "jsdoc",
  },
  {
    match: /\/\/.*\n?/g,
    sub: "todo",
  },
  {
    // block comments nest: `/* /* */ */` is one comment, and the inner `*/`
    // closes nothing. No regex can count, so the depth is tracked by hand.
    match: new (class {
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
    sub: "todo",
  },
  {
    // raw string: no escapes at all, and it ends at the first `"""`
    type: "str",
    match: /"""[^]*?"""/g,
    sub: [interpolation],
  },
  {
    // an escaped `$` is matched first, so it cannot open an interpolation
    type: "str",
    match: /"((?!")[^\r\n\\]|\\[^])*"?/g,
    sub: [escape, interpolation],
  },
  {
    // a char literal is always closed on the same line
    type: "str",
    match: /'(\\u[\da-fA-F]{0,4}|\\[^]|[^\r\n\\'])'/g,
    sub: [escape],
  },
  {
    // digit separators, and the `f`/`L`/`u`/`uL` suffixes, are part of the
    // number, and so are the `0x`/`0b` prefixes
    type: "num",
    match: /(\.|\b)\d[\d_]*(\.\d[\d_]*)?(e[+-]?\d+)?\w*/gi,
  },
  {
    // annotation, with its optional use-site target: `@Composable`, `@field:Json`
    type: "type",
    match: /@(\w+:)?[A-Z]\w*/g,
  },
  {
    type: "bool",
    match: /\b(true|false|null)\b/g,
  },
  {
    // the lookbehind keeps a member access out of it: `Db.open()` is a call,
    // not the `open` modifier. The use-site targets (`field`, `param`, …) are
    // left out on purpose — they are only keywords inside an annotation, which
    // the rule above already claims whole.
    type: "kwd",
    match:
      /(?<!\.)\b(abstract|actual|annotation|as|break|by|catch|class|companion|const|constructor|continue|crossinline|data|do|dynamic|else|enum|expect|external|field|final|finally|for|fun|get|if|import|in|infix|init|inline|inner|interface|internal|is|lateinit|noinline|object|open|operator|out|override|package|private|protected|public|reified|return|sealed|set|super|suspend|tailrec|this|throw|try|typealias|val|var|vararg|when|where|while)\b/g,
  },
  {
    // a loop or lambda label: `loop@`, `return@forEach`
    type: "var",
    match: /\b\w+@|@\w+\b/g,
  },
  {
    // the implicit parameter of a single argument lambda
    type: "var",
    match: /\bit\b/g,
  },
  {
    // the infix members that read as operators, as Prism does
    type: "oper",
    match: /[/*+:?&|%^~=!,<>.^-]+|\b(and|inv|or|shl|shr|ushr|xor|to|downTo|until|step)\b/g,
  },
  {
    // a call, or the receiver of a trailing lambda: `lazy { … }`
    type: "func",
    match: /[a-zA-Z_]\w*(?=\s*\()|[a-z_]\w*(?=\s*\{)/g,
  },
  {
    type: "class",
    match: /\b[A-Z]\w*\b/g,
  },
] as ShjLanguageDefinition;
