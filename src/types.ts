/**
 * Shared types, imported by the `.ts` sources.
 */

/**
 * Default languages supported
 */
export type ShjLanguage =
  | "asm"
  | "bash"
  | "bf"
  | "c"
  | "css"
  | "csv"
  | "diff"
  | "docker"
  | "git"
  | "go"
  | "html"
  | "http"
  | "ini"
  | "java"
  | "js"
  | "jsdoc"
  | "json"
  | "leanpub-md"
  | "log"
  | "lua"
  | "make"
  | "md"
  | "pl"
  | "plain"
  | "py"
  | "regex"
  | "rs"
  | "sql"
  | "todo"
  | "toml"
  | "ts"
  | "uri"
  | "xml"
  | "yaml";

/**
 * Bundled themes, usable both in the browser and in the terminal
 */
export type ShjThemeName =
  | "atom-dark"
  | "dark"
  | "default"
  | "github-dark"
  | "github-dim"
  | "github-light"
  | "visual-studio-dark";

/**
 * A theme is plain data: colors keyed by token type.
 *
 * The highlighter inlines it as `style` attributes, the terminal adaptor turns
 * it into ANSI escape sequences.
 */
export interface ShjTheme {
  /** Unique name */
  name: string;
  /** Used for the `color-scheme` CSS property */
  scheme?: "light" | "dark";
  /** Background color of the code block */
  bg: string;
  /** Default text color of the code block */
  fg: string;
  /** Color of the line numbers (defaults to the `cmnt` token color) */
  numbers?: string;
  /** Color of each token type */
  tokens: Partial<Record<ShjToken, string>>;
}

/**
 * A light and a dark theme, applied with `prefers-color-scheme`
 */
export interface ShjThemePair {
  light: ShjTheme;
  dark: ShjTheme;
}

export interface ShjOptions {
  /**
   * The language of the code
   *
   * @default "plain"
   */
  lang?: ShjLanguage;
  /**
   * The theme, inlined in the generated markup as `style` attributes
   *
   * A light/dark pair is inlined as `light-dark()` colors, following the color
   * scheme of the reader.
   *
   * @default the bundled themes, import any other one from `rangbuzz/themes`
   */
  theme?: ShjTheme | ShjThemePair;
  /**
   * Render the code as an inline `<code>` element instead of a block
   *
   * A block is `multiline` when the code contains a line break, `oneline`
   * otherwise.
   *
   * @default false
   */
  inline?: boolean;
  /**
   * Indicates whether to number the lines of a multiline code
   *
   * @default true
   */
  lineNumbers?: boolean;
}

export interface ShjTerminalOptions {
  /**
   * The language of the code
   *
   * @default "plain"
   */
  lang?: ShjLanguage;
  /**
   * The theme, emitted as 24 bit escape sequences
   *
   * A light/dark pair is read as its dark theme.
   *
   * @default the bundled themes
   */
  theme?: ShjTheme | ShjThemePair;
}

/**
 * * `inline` inside `code` element
 * * `oneline` inside `div` element and containing only one line
 * * `multiline` inside `div` element
 */
export type ShjDisplayMode = "inline" | "oneline" | "multiline";

/**
 * Token types
 */
export type ShjToken =
  | "deleted"
  | "err"
  | "var"
  | "section"
  | "kwd"
  | "class"
  | "cmnt"
  | "insert"
  | "type"
  | "func"
  | "bool"
  | "num"
  | "oper"
  | "str"
  | "esc";

export type ShjLanguageComponent =
  | { match: RegExp; type: string }
  | {
      match: RegExp;
      sub: string | ShjLanguageDefinition | ((code: string) => ShjLanguageComponent);
    }
  | { expand: string };

export type ShjLanguageDefinition = ShjLanguageComponent[];
