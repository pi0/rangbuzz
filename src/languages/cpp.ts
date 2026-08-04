import type { ShjLanguageDefinition } from "../types.ts";
import { BOOL, CLASS, FUNC, KWD, NUM, OPER, STR } from "../tokens.ts";
import { bracket, str } from "../common.ts";
export default [
  [/\/\/.*\n?|\/\*((?!\*\/)[^])*(\*\/)?/g, , "todo"],
  // raw string: the delimiter is whatever sits between R" and (, and closes it
  [/\b(?:u8|[uUL])?R"([^\s()\\]{0,16})\(([^]*?)\)\1"/g, STR],
  // a char or string literal may carry an encoding prefix
  [/\b(?:u8|[uUL])(["'])(\\[^]|(?!\1)[^\r\n\\])*\1?/g, STR],
  str,
  // digit separators are part of the number, not the start of a char literal
  [/(\.|\b)\d[\d.']*(e[+-]?\d+)?\w*/gi, NUM],
  [/#\s*include (<.*>|".*")/g, KWD, [[/(<|").*/g, STR]]],
  [/\b(true|false|nullptr)\b/g, BOOL],
  [
    /#[a-z]+\b|\b(alignas|alignof|and|and_eq|asm|auto|bitand|bitor|bool|break|case|catch|char|char8_t|char16_t|char32_t|class|co_await|co_return|co_yield|compl|concept|const|const_cast|consteval|constexpr|constinit|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|noexcept|not|not_eq|operator|or|or_eq|private|protected|public|register|reinterpret_cast|requires|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while|xor|xor_eq)\b/g,
    KWD,
  ],
  [/[/*+:?&|%^~=!,<>.^-]+/g, OPER],
  [/[a-zA-Z_][\w_]*(?=\s*\()/g, FUNC],
  [/\b[A-Z][\w_]*\b|\b[a-z_]\w*(?=::)/g, CLASS],
  bracket,
] as ShjLanguageDefinition;
