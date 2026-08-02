# AGENTS.md

`rangbuzz` — a tiny, zero-dependency, fully synchronous syntax highlighter (fork of Speed Highlight JS). It takes code + a language and returns self-contained HTML (theme colors inlined as `style` attributes) or ANSI for the terminal.

## Layout

- `src/highlight.ts` — the core: `eachToken()` (regex rule engine, callback based, internal), `tokenize()` (public wrapper returning `ShjTokenized[]`), `highlightText()` (tokens + line-number gutter), `codeToHtml()` (full block markup).
- `src/terminal.ts` — `codeToAnsi()` / `printHighlight()`, same tokens as 24-bit escapes.
- `src/detect.ts` — `detectLanguage()`, scored regex heuristics.
- `src/languages/*.ts` — one file per grammar, default-exporting `ShjLanguageDefinition` (an array of `{match, type}` / `{match, sub}` / `{expand}` rules). `src/common.ts` holds the shared `expand` patterns.
- `src/languages.ts` — static registry of every grammar; `ShjLanguage` is derived from it.
- `src/themes/*.ts` — one file per theme (plain data: `bg`, `fg`, `tokens` per token type); `src/themes/index.ts` re-exports them and derives `ShjThemeName`.
- `src/defaults.ts` — the only two themes the main entry pulls in (`default` light + `dark`, inlined as `light-dark()`).
- `src/types.ts` — all public types.
- `test/` — vitest, asserts exact output strings.

Two build entries (`build.config.ts`): `.` → `src/index.ts`, `./themes` → `src/themes/index.ts`. Everything else must stay reachable only from those, so themes stay tree-shakeable.

## Conventions

- Everything is synchronous and side-effect free; every language is bundled, nothing is lazily loaded or globally registered. Custom languages arrive per call via the `languages` option and are looked up before bundled ones.
- Unknown language / bad grammar degrades to plain text, never throws (`eachToken` swallows errors).
- Bundle size matters: prefer terse code, no dependencies, no runtime CSS.
- Imports use explicit `.ts` extensions.
- Adding a language: new file in `src/languages/`, register in `src/languages.ts`, add a row to the README table (+ `src/detect.ts` if detectable).
- Adding a theme: new file in `src/themes/`, export from `src/themes/index.ts`, add to `ShjThemeName` and the README table.

## Commands

`pnpm test` (lint + typecheck + vitest w/ coverage) · `pnpm dev` (vitest watch) · `pnpm build` (obuild) · `pnpm fmt` (automd + oxlint --fix + oxfmt).
