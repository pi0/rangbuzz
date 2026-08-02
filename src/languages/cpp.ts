import type { ShjLanguageDefinition } from "../types.ts";
export default [
  {
    match: /\/\/.*\n?|\/\*((?!\*\/)[^])*(\*\/)?/g,
    sub: "todo",
  },
  {
    // raw string: the delimiter is whatever sits between R" and (, and closes it
    type: "str",
    match: /\b(?:u8|[uUL])?R"([^\s()\\]{0,16})\(([^]*?)\)\1"/g,
  },
  {
    // a char or string literal may carry an encoding prefix
    type: "str",
    match: /\b(?:u8|[uUL])(["'])(\\[^]|(?!\1)[^\r\n\\])*\1?/g,
  },
  {
    expand: "str",
  },
  {
    // digit separators are part of the number, not the start of a char literal
    type: "num",
    match: /(\.|\b)\d[\d.']*(e[+-]?\d+)?\w*/gi,
  },
  {
    type: "kwd",
    match: /#\s*include (<.*>|".*")/g,
    sub: [
      {
        type: "str",
        match: /(<|").*/g,
      },
    ],
  },
  {
    type: "bool",
    match: /\b(true|false|nullptr)\b/g,
  },
  {
    type: "kwd",
    match:
      /#[a-z]+\b|\b(alignas|alignof|and|and_eq|asm|auto|bitand|bitor|bool|break|case|catch|char|char8_t|char16_t|char32_t|class|co_await|co_return|co_yield|compl|concept|const|const_cast|consteval|constexpr|constinit|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|noexcept|not|not_eq|operator|or|or_eq|private|protected|public|register|reinterpret_cast|requires|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while|xor|xor_eq)\b/g,
  },
  {
    type: "oper",
    match: /[/*+:?&|%^~=!,<>.^-]+/g,
  },
  {
    type: "func",
    match: /[a-zA-Z_][\w_]*(?=\s*\()/g,
  },
  {
    type: "class",
    match: /\b[A-Z][\w_]*\b|\b[a-z_]\w*(?=::)/g,
  },
] as ShjLanguageDefinition;
