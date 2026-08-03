/**
 * Shared types, imported by the `.ts` sources.
 */

// Both names are derived from the registries themselves, so that adding a
// language or a theme is a one line change in a single file.
import type { ShjLanguage, ShjLanguageAlias } from "./languages.ts";
import type { ShjToken } from "./tokens.ts";

export type { ShjLanguage, ShjLanguageAlias, ShjToken };
export type { ShjThemeName } from "./themes/index.ts";

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

/**
 * The options every entry point shares: what to highlight, and with which
 * grammar.
 */
export interface ShjTokenizeOptions {
  /**
   * The language of the code
   *
   * An alias of a bundled language — `yml`, `mjs`, `python` — names the same
   * grammar as the language itself does. Any name of
   * {@link ShjTokenizeOptions.languages} is accepted as well.
   *
   * @default "plain"
   */
  lang?: ShjLanguage | ShjLanguageAlias | (string & {});
  /**
   * Custom languages, keyed by language name
   *
   * They are looked up before the bundled ones, so a bundled language can be
   * overridden, and are used for sub-languages too.
   *
   * @example
   * codeToHtml(code, { lang: "mine", languages: { mine: myLanguage } });
   */
  languages?: ShjLanguages;
}

/**
 * A single piece of tokenized code, as returned by `tokenize`
 */
export interface ShjTokenized {
  /**
   * The raw text of the token, unescaped and never empty
   *
   * It may span line breaks — a block comment or a template literal is one
   * token however many lines it covers.
   */
  text: string;
  /**
   * The type of the token, and the key a {@link ShjTheme} assigns a color to
   *
   * Absent for text that no rule of the language matched.
   */
  type?: ShjToken;
}

export interface ShjOptions extends ShjTokenizeOptions {
  /**
   * The theme, inlined in the generated markup as `style` attributes
   *
   * A light/dark pair is inlined as `light-dark()` colors, following the color
   * scheme of the reader.
   *
   * @default the bundled themes, import any other one from `rangi/themes`
   */
  theme?: ShjTheme | ShjThemePair;
  /**
   * Emit class names instead of inline styles
   *
   * The markup then carries no `style` attribute at all: the block is
   * `shj shj-lang-<lang> shj-<mode>`, each typed token is a `shj-<type>` span,
   * and a multiline block wraps its gutter and its code in `shj-scroll` and
   * `shj-code`. Nothing is styled until you supply a stylesheet — including
   * `white-space:pre`, without which the code collapses.
   *
   * {@link ShjOptions.theme} is unused in this mode. To keep the styles inline
   * and only move the colors out, leave this off and pass the `cssVariables`
   * theme instead.
   *
   * @default false
   */
  classes?: boolean;
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

export interface ShjTerminalOptions extends ShjTokenizeOptions {
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
 * The same options as {@link ShjTokenizeOptions}, as `rangi/core` takes them
 *
 * That entry bundles nothing, so what the main entry defaults to is given
 * explicitly instead: `languages: {}` is a call that highlights nothing.
 */
export type ShjCoreTokenizeOptions = ShjTokenizeOptions &
  Required<Pick<ShjTokenizeOptions, "languages">>;

/**
 * The same options as {@link ShjOptions}, as `rangi/core` takes them: the
 * languages and the theme are required, since none is bundled
 *
 * `classes: true` renders no color at all, so it takes the place of the theme
 * rather than being passed alongside one.
 */
export type ShjCoreOptions = ShjOptions &
  Required<Pick<ShjOptions, "languages">> &
  ({ classes: true } | Required<Pick<ShjOptions, "theme">>);

/**
 * The same options as {@link ShjTerminalOptions}, as `rangi/core` takes
 * them: the languages and the theme are required, since none is bundled
 */
export type ShjCoreTerminalOptions = ShjTerminalOptions &
  Required<Pick<ShjTerminalOptions, "languages" | "theme">>;

/**
 * * `inline` inside `code` element
 * * `oneline` inside `div` element and containing only one line
 * * `multiline` inside `div` element
 */
export type ShjDisplayMode = "inline" | "oneline" | "multiline";

/**
 * A token type as a grammar refers to it: the index of a bundled type in
 * `TOKENS`, which is what the bundled grammars use, or its name — which is
 * what a custom language will usually reach for
 */
export type ShjTokenRef = number | ShjToken | (string & {});

/**
 * What the rule engine asks of a pattern: it drives `lastIndex` itself and
 * calls `exec`, which is all it ever uses a `RegExp` for
 *
 * A grammar may hand over anything that behaves that way. `js_template_literals`
 * does, to balance the braces of a `${…}` interpolation — which a regular
 * expression cannot do.
 */
export interface ShjMatcher {
  lastIndex: number;
  exec(str: string): { index: number; 0: string } | null;
}

/**
 * A single rule of a grammar, as a tuple
 *
 * The positions are `[match, type, sub]`, and the trailing ones are optional —
 * a rule with a `sub` but no `type` of its own leaves a hole: `[/…/g, , "js"]`.
 * The tuple form is what keeps the bundled grammars small: property names
 * cannot be minified, tuple positions cost nothing.
 *
 * * `match` — the pattern, which must carry the `g` flag if it is a regex
 * * `type` — the token type the match is emitted as
 * * `sub` — highlight the match with another language instead: a language name,
 *   an inline definition, or a callback returning either a language name or an
 *   anonymous {@link ShjSubLanguage}
 */
export type ShjLanguageComponent = [
  match: RegExp | ShjMatcher,
  type?: ShjTokenRef,
  sub?: string | ShjLanguageDefinition | ((code: string) => string | ShjSubLanguage),
];

/**
 * What a `sub` callback may return besides a language name: an anonymous
 * language, with the token type applied to whatever its rules leave unmatched
 *
 * It is the same tuple as a rule, with the `match` position left empty.
 */
export type ShjSubLanguage = [
  match: undefined,
  type: ShjTokenRef | undefined,
  sub: ShjLanguageDefinition,
];

export type ShjLanguageDefinition = ShjLanguageComponent[];

/**
 * A language, either as a bare definition or in module shape, so that
 * `import * as mine from "./mine.ts"` can be handed over as is
 *
 * The optional `type` is the token type applied to whatever the rules of the
 * language leave unmatched.
 */
export type ShjLanguageModule =
  | ShjLanguageDefinition
  | { default: ShjLanguageDefinition; type?: ShjTokenRef };

/**
 * Language definitions keyed by language name
 */
export type ShjLanguages = Record<string, ShjLanguageModule>;
