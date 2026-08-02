/**
 * @module tokens
 * (The token types, by name and by index)
 *
 * A bundled grammar refers to a token type by its index rather than by its
 * name: the bundler inlines the constants below, so a rule spends one digit
 * where a quoted name would cost five to seven bytes — worth a few percent of
 * the bundle across the ~380 rules of the registry.
 *
 * Nothing outside the grammars ever sees an index. {@link TOKENS} maps back,
 * and the tokenizer resolves the name before it hands a token to a theme, a
 * callback or the caller — so a custom language is free to keep naming its
 * types, and may use one that is not on this list.
 */

/** Every token type, in the order the constants below number them */
export const TOKENS = [
  "deleted",
  "err",
  "var",
  "section",
  "kwd",
  "class",
  "cmnt",
  "insert",
  "type",
  "func",
  "bool",
  "num",
  "oper",
  "str",
  "esc",
] as const;

export const DELETED = 0,
  ERR = 1,
  VAR = 2,
  SECTION = 3,
  KWD = 4,
  CLASS = 5,
  CMNT = 6,
  INSERT = 7,
  TYPE = 8,
  FUNC = 9,
  BOOL = 10,
  NUM = 11,
  OPER = 12,
  STR = 13,
  ESC = 14;

/**
 * Token types
 *
 * The key a {@link ShjTheme} assigns a color to.
 */
export type ShjToken = (typeof TOKENS)[number];
