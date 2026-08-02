# AGENTS.md

`rangbuzz` — a tiny, zero-dependency, fully synchronous syntax highlighter (fork of Speed Highlight JS). It takes code + a language and returns self-contained HTML (theme colors inlined as `style` attributes) or ANSI for the terminal.

## Layout

- `src/highlight.ts` — the core: `eachToken()` (regex rule engine, callback based, internal), `tokenize()` (public wrapper returning `ShjTokenized[]`), `highlightText()` (tokens + line-number gutter), `codeToHtml()` (full block markup). It imports no grammar and no theme: both arrive per call, which is what makes `rangbuzz/core` bundle nothing.
- `src/terminal.ts` — `codeToAnsi()` / `printHighlight()`, same tokens as 24-bit escapes.
- `src/core.ts` — the `./core` entry, re-exporting those functions as they are; their `languages` and `theme` options are required (`ShjCore*Options` in `src/types.ts`, the main option types with those two made required).
- `src/index.ts` — the `.` entry: the same functions, wrapped to fill in the bundled registry and `defaultThemes`. Custom languages are merged over the bundled ones, so they still win and still apply to sub-languages.
- `src/detect.ts` — `detectLanguage()`, scored regex heuristics.
- `src/languages/*.ts` — one file per grammar, default-exporting `ShjLanguageDefinition` (an array of `[match, type?, sub?]` rule tuples; a rule with a `sub` but no `type` leaves a hole, `[/…/g, , "js"]`). `src/common.ts` exports the shared rules (`num`, `str`, `strDouble`), imported and dropped into a grammar as is.
- `src/languages.ts` — static registry of every grammar; `ShjLanguage` is derived from it. It is the `./languages` entry too, so every grammar is also a named export under its exact registry key (the four that carry a `type` are assembled into `{ default, type }` there); a test asserts the exports and the registry stay in step.
- `src/themes/*.ts` — one file per theme (plain data: `bg`, `fg`, `tokens` per token type); `src/themes/index.ts` re-exports them and derives `ShjThemeName`.
- `src/defaults.ts` — the only two themes the main entry pulls in (`default` light + `dark`, inlined as `light-dark()`).
- `src/tokens.ts` — the token types: `TOKENS` (names, in order) plus one `const` per type holding its index. A grammar refers to a type by the constant, which the bundler inlines to a digit; `tokenName()` in `highlight.ts` maps it back, so nothing outside a grammar ever sees an index.
- `src/types.ts` — all public types.
- `test/` — vitest, asserts exact output strings.
- `test/languages/` — one file per grammar, each an inline corpus handed to `testLanguage()` (`_harness.ts`) plus the differences from the judges it is allowed to have. `_judges.ts` holds the cross check against Prism (`refractor`) and Shiki, both dev dependencies.

Four build entries (`build.config.ts`): `.` → `src/index.ts`, `./core` → `src/core.ts`, `./languages` → `src/languages.ts`, `./themes` → `src/themes/index.ts`. Everything else must stay reachable only from those, so themes stay tree-shakeable. Nothing `src/core.ts` reaches may import `src/languages.ts` or `src/defaults.ts` — that is the whole point of the entry, and it is what keeps it ~3kB min+gzip against ~14kB for the main one.

## Conventions

- Everything is synchronous and side-effect free; every language is bundled, nothing is lazily loaded or globally registered. Custom languages arrive per call via the `languages` option and are looked up before bundled ones.
- Unknown language / bad grammar degrades to plain text, never throws (`eachToken` swallows errors).
- Bundle size matters: prefer terse code, no dependencies, no runtime CSS.
- Imports use explicit `.ts` extensions.
- Token types are referenced by their constant from `src/tokens.ts`, never by name — a name in a bundled grammar is a missed byte. Adding a type means a new entry in `TOKENS` and a matching constant; a test asserts the two stay aligned. A custom language may still name its types, including ones that are not bundled.
- Adding a language: new file in `src/languages/`, register in `src/languages.ts` — both in the `export {}` block and in the `languages` object — add a row to the README table (+ `src/detect.ts` if detectable), and add `test/languages/<lang>.test.ts` — the registry test fails without it. Map it to a Prism and a Shiki grammar in `test/languages/_judges.ts` if either has one, and to its Linguist name (or `[]`) in `scripts/language-stats.ts` — that map is keyed by `ShjLanguage`, so a missing entry fails typecheck.
- A grammar is only asserted against the judges where both of them agree with each other, and only on comments and strings. Anything else the corpus turns up has to be declared as a divergence with a reason, so no difference from Prism and Shiki stays unexplained; the ones marked `bug: true` are known defects, not decisions.
- Adding a theme: new file in `src/themes/`, export from `src/themes/index.ts`, add to `ShjThemeName` and the README table.

## Commands

`pnpm test` (lint + typecheck + vitest w/ coverage) · `pnpm dev` (vitest watch) · `pnpm build` (obuild) · `pnpm fmt` (automd + oxlint --fix + oxfmt) · `pnpm language-stats` (rank the bundled grammars against GitHub usage; needs network).
