import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, FUNC, KWD, OPER, STR, TYPE, VAR } from "../tokens.ts";
import { bracket, num, strDouble } from "../common.ts";

export default [
  [/#.*/g, , "todo"],
  // block string, which doubles as a description, may span lines and knows a
  // single escape: `\"""`
  [/"""(\\"""|(?!""")[^])*(""")?/g, STR],
  strDouble,
  num,
  [/\b(true|false|null)\b/g, BOOL],
  [
    /\b(query|mutation|subscription|fragment|on|type|input|interface|union|enum|scalar|schema|directive|extend|implements|repeatable)\b/g,
    KWD,
  ],
  [/@\w+/g, FUNC],
  // a type name, an operation name and an enum value are all capitalized
  [/\b[A-Z]\w*/g, TYPE],
  // a variable, and every name left over: a field, an argument or an alias
  [/\$?\w+/g, VAR],
  // `[]` — the list type — is left to the `bracket` rule with `()` and `{}`
  [/\.{3}|[!=|&:-]/g, OPER],
  bracket,
] as ShjLanguageDefinition;
