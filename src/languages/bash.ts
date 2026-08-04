import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, FUNC, KWD, OPER, STR, VAR } from "../tokens.ts";
import { bracket, num } from "../common.ts";
let variable = [/\$\w+|\${[^}]*}|\$\([^)]*\)/g, VAR];

export default [
  [/#.*/g, , "todo"],
  [/(["'])((?!\1)[^\r\n\\]|\\[^])*\1?/g, STR, [variable]],
  // relative or absolute path
  [/(?<=\s|^)\.*\/[a-z/_.-]+/gi, OPER],
  [
    /\s-[a-zA-Z]+|$<|[&|;]+|\b(unset|readonly|shift|export|if|fi|else|elif|while|do|done|for|until|case|esac|break|continue|exit|return|trap|wait|eval|exec|then|declare|enable|local|select|typeset|time|add|remove|install|update|delete)(?=\s|$)/g,
    KWD,
  ],
  num,
  // command
  [/(?<=(^|\||&&|;)\s*)[a-z_.-]+(?=\s|$)/gim, FUNC],
  [/(?<=\s|^)(true|false)(?=\s|$)/g, BOOL],
  // {
  // 	// function definition
  // 	type: 'func',
  // 	match: /(?<=\s|^)[a-z_]+(?=\s*\()/g
  // },
  // `(){}` are left to the `bracket` rule; `<>` stay redirections
  [/[=<>!]+/g, OPER],
  [/(?<=\s|^)[\w_]+(?=\s*=)/g, VAR],
  variable,
  bracket,
] as ShjLanguageDefinition;
