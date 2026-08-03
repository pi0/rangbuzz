/**
 * @module detect
 * (Language detector)
 */

import type { ShjLanguage } from "./types.ts";

const languages: [ShjLanguage, ...[RegExp, number][]][] = [
  ["bash", [/#!(\/usr)?\/bin\/bash/g, 500], [/\b(if|elif|then|fi|echo)\b|\$/g, 10]],
  ["html", [/<\/?[a-z-]+[^\n>]*>/g, 10], [/^\s+<!DOCTYPE\s+html/g, 500]],
  ["http", [/^(GET|HEAD|POST|PUT|DELETE|PATCH|HTTP)\b/g, 500]],
  [
    "js",
    [
      /\b(console|await|async|function|export|import|this|class|for|let|const|map|join|require|document|window)\b/g,
      10,
    ],
  ],
  [
    "ts",
    [
      /\b(console|await|async|function|export|import|this|class|for|let|const|map|join|require|document|window|implements|interface|namespace)\b/g,
      10,
    ],
  ],
  [
    "jsx",
    [
      /<[A-Z][\w.]*[^\n<>]*>|<\/[A-Z][\w.]*>|=\{|=>\s*\(?\s*<[a-zA-Z]|(?<!=)>\{[^{]|<\/[a-z][\w.]*>\s*[;,)]/g,
      20,
    ],
  ],
  [
    "tsx",
    [
      /<[A-Z][\w.]*[^\n<>]*>|<\/[A-Z][\w.]*>|=\{|=>\s*\(?\s*<[a-zA-Z]|(?<!=)>\{[^{]|<\/[a-z][\w.]*>\s*[;,)]/g,
      20,
    ],
    [
      /\b(implements|interface|namespace|declare|readonly|satisfies)\b|:\s*(string|number|boolean|void)\b/g,
      10,
    ],
  ],
  [
    "py",
    [
      /\b(def|print|await|async|class|and|or|lambda|import|from|self|asyncio|pass|True|False|None|__init__)\b/g,
      10,
    ],
  ],
  ["sql", [/\b(SELECT|INSERT|FROM)\b/g, 50]],
  ["pl", [/#!(\/usr)?\/bin\/perl/g, 500], [/\b(use|print)\b|\$/g, 10]],
  ["lua", [/#!(\/usr)?\/bin\/lua/g, 500]],
  ["make", [/\b(ifneq|endif|if|elif|then|fi|echo|.PHONY|^[a-z]+ ?:$)\b|\$/gm, 10]],
  // a uri document is uris, one per line — a url sitting in a string or a
  // comment belongs to whatever language put it there, and there is one in
  // most json files
  ["uri", [/^\s*(https?|mailto|tel|ftp):\S+\s*$/gm, 30]],
  ["css", [/^(@import|@page|@media|(\.|#)[a-z]+)/gm, 20]],
  ["diff", [/^[+><-]/gm, 10], [/^@@ ?[-+,0-9 ]+ ?@@/gm, 25]],
  ["md", [/^(>|\t\*|\t\d+.)/gm, 10], [/\[.*\](.*)/g, 10]],
  ["docker", [/^(FROM|ENTRYPOINT|RUN)/gm, 500]],
  ["xml", [/<\/?[a-z-]+[^\n>]*>/g, 10], [/^<\?xml/g, 500]],
  ["cpp", [/\bstd::|#include\s*<(iostream|vector|string|memory|algorithm)>|\btemplate\s*</g, 100]],
  ["c", [/#include\b|\bprintf\s+\(/g, 100]],
  ["cs", [/\busing\s+System\b|\bnamespace\s+\w+|\bConsole\.\w+/g, 100]],
  ["php", [/<\?php\b/g, 500], [/\$\w+\s*=|\becho\b|->/g, 10]],
  ["rb", [/#!(\/usr)?\/bin\/ruby/g, 500], [/\bdef\b[^\n]*\n|\bend\b|\brequire\b|:\w+\s*=>/g, 10]],
  ["scss", [/^\s*\$[\w-]+\s*:|@(mixin|include|extend|use)\b|&:/gm, 50]],
  ["ps1", [/\$(PSVersionTable|_|env:)|\b(Write-Host|Get-\w+|Set-\w+|param)\b/g, 100]],
  ["kt", [/\bfun\s+\w+\s*\(|\bval\b|\bvar\b.*:\s*\w+|\bcompanion object\b/g, 50]],
  ["swift", [/\bfunc\s+\w+\s*\(|\blet\b.*=|@(IBOutlet|objc|State)\b|\bguard\b.*\belse\b/g, 50]],
  ["vue", [/<template>|<script setup|\bv-(if|for|bind|model|on)\b|@click=/g, 100]],
  // the logic blocks are unmistakable; a directive alone is only a hint, `class:`
  // and `on:` are too close to a plain yaml key to be worth more
  [
    "svelte",
    [/\{[#:/](if|each|await|then|catch|key|snippet|render)\b/g, 100],
    [/\s(on|bind|use|transition|animate|class|let):[\w|-]+(?==|[\s/>])/g, 50],
  ],
  ["astro", [/^---\n[^]*?\n---/g, 500], [/\s(client|server|set|is):[\w-]+/g, 100]],
  // `type Foo =` is TypeScript, `type Foo {` is not, so the definition keywords
  // only count where no `=` follows
  [
    "graphql",
    [/\b(query|mutation|subscription|fragment)\s+\w+\s*(\(|\{|on\b)/g, 100],
    [/^\s*(type|input|enum|union|scalar|schema|directive)\s+\w+(?!\s*=)/gm, 30],
  ],
  // `@var: value;` — a css at-rule never has its colon glued to the name
  ["less", [/@[\w-]+\s*:[^;{]+;|\.[\w-]+\([^)]*\)\s*;/g, 50]],
  ["dart", [/\bWidget\b|\bbuild\s*\(BuildContext|\bimport\s+'package:|\bfinal\b.*;/g, 50]],
  ["rs", [/^\s+(use|fn|mut|match)\b/gm, 100]],
  ["go", [/\b(func|fmt|package)\b/g, 100]],
  ["java", [/^import\s+java/gm, 500]],
  ["asm", [/^(section|global main|extern|\t(call|mov|ret))/gm, 100]],
  ["css", [/^(@import|@page|@media|(\.|#)[a-z]+)/gm, 20]],
  // a json document is one value: it opens with `{`, `[` or `"` and closes at
  // the very end, which is what tells it from a fragment of something else —
  // no keyword to go on, so the shape carries it, and stays well under what a
  // language with a signature of its own scores. what it cannot rule out is a
  // graphql selection set or a bare js object literal, hence the call: json
  // has no parentheses outside a string, so one is worth a key or three
  // against. a penalty rather than an exclusion, because a string may well
  // contain one and a document full of keys should survive it
  [
    "json",
    [/^\s*(?:[[{][^]*[\]}]|"(?:[^"\\]|\\.)*")\s*$/g, 25],
    [/"[^"\n]*"\s*:/g, 6],
    [/[\w$]\(/g, -20],
  ],
  ["yaml", [/^(\s+)?[a-z][a-z0-9]*:/gim, 10]],
];

/**
 * Try to find the language the given code belong to
 *
 * @function detectLanguage
 * @param {string} code The code
 * @returns {ShjLanguage} The language of the code
 */
export const detectLanguage = (code: string): ShjLanguage => {
  return (
    languages
      .map(([lang, ...features]): [ShjLanguage, number] => [
        lang,
        features.reduce((acc, [match, score]) => acc + [...code.matchAll(match)].length * score, 0),
      ])
      .filter(([_lang, score]) => score > 20)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "plain"
  );
};
