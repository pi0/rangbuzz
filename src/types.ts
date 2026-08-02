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
 * Themes supported in the browser
 */
export type ShjBrowserTheme =
  | "atom-dark"
  | "github-dark"
  | "github-dim"
  | "dark"
  | "default"
  | "github-light"
  | "visual-studio-dark";

/**
 * Themes supported in the terminal
 */
export type ShjTerminalTheme = "default" | "atom-dark";

export interface ShjOptions {
  /**
   * Indicates whether to hide line numbers
   *
   * @default false
   */
  hideLineNumbers?: boolean;
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
